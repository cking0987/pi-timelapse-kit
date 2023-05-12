/*
TODO: 

-allow for multiple projects. That means scanning the img directory for unique project names first, then scoping all subsequent functions to that specific project. 
-better state management. each project should have initial,ready, and playing states. In initial, the controls should be hidden/disabled and there should be a clear button to click to load.
-add preload check to prev next buttons
*/

let tlProject = {
	imgSet: []
};

function getImages() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/load_images.php', true);
  xhr.onload = function () {
    if (this.status == 200) {
      var images = JSON.parse(this.responseText);
			buildTimelapseProjectDataObject(images);
    }
  };
  xhr.send();
}
getImages();

function buildTimelapseProjectDataObject(images) {
	// This is just grabbing the project name from the first image in the list. This should be expanded to fist check for unique project names among all the files, then build a project data object for each #fixme
	tlProject.name = images[0].split('/')[1].split('_')[0];
	for (let i=0; i < images.length; i++) {
		img = {};
		img.filepath = images[i];
		img.filename = images[i].split('/')[1];
		imgMeta = images[i].split("_");
		img.projectName = imgMeta[0].split("/")[1];
		img.date = imgMeta[1];
		img.time = imgMeta[2].split(".")[0];
		tlProject.imgSet.push(img);
	}
	// Same with this info below. It's currently setting the values assuming there is only one tlProject. It should be expanded to run for each unique tlProject. 
	tlProject.startDate = tlProject.imgSet[0].date;
	tlProject.endDate = tlProject.imgSet.at(-1).date;
	const durationInMs = new Date(tlProject.endDate) - new Date(tlProject.startDate);
	tlProject.duration = durationInMs / (1000 * 60 * 60 * 24);
	tlProject.nFrames = tlProject.imgSet.length;
	addProjectToDOM(tlProject);
}

function addProjectToDOM(project) {
	const projectEl = `
		<div class="project-container initial" id="project-`+project.name+`">
			<div class="project-meta">
				<div id="project-name" class="meta-property">
					<div class="label">project name:</div><div class="value">`+project.name+`</div>
				</div>
				<div id="start" class="meta-property">
					<div class="label">start:</div><div class="value">`+project.startDate+`</div>
				</div>
				<div id="end" class="meta-property">
					<div class="label">end:</div><div class="value">`+project.endDate+`</div>
				</div>
				<div id="duration" class="meta-property">
					<div class="label">duration:</div><div class="value">`+project.duration+` days</div>
				</div>
				<div id="frames" class="meta-property">
					<div class="label">frames:</div><div class="value">`+project.nFrames+`</div>
				</div>
			</div>
			<div class="slideshow-container" id="slideshow-`+project.name+`">
				<figure>
					<img src="`+project.imgSet[0].filepath+`" class="slide-img" alt="An image in a timelapse slideshow. The project name is`+project.name+`">
					<figcaption class="slide-name">`+project.imgSet[0].filename+`</figcaption>
				</figure>
				<div class="ring">Loading
					<span></span>
				</div>
			</div>
			<div class="project-controls">
				<button onClick="previousSlide()">prev</button> | 
				<button onClick="playPause()">play/pause</button> | 
				<button onClick="nextSlide()">next</button>
			</div>
		</div>
	`;
	document.body.innerHTML += projectEl;
}

let currentIndex = 0;
let isPlaying = false;
let loadedCount = 0;
let slideContainer, slideImage, slideFilename, imageCount, slideshowInterval, projectContainer;

function preloadImages() {
	projectContainer = document.getElementById('project-'+tlProject.name);
	slideContainer = document.getElementById('slideshow-'+tlProject.name);
	slideImage = slideContainer.querySelector('img');
	slideFilename = slideContainer.querySelector('figcaption');
	imageCount = tlProject.nFrames;
	projectContainer.classList.remove('initial');
	projectContainer.classList.add('loading');
	for (let i = 0; i < imageCount; i++) {
		const image = new Image();
		image.onload = () => {
			loadedCount++;
			if (loadedCount === imageCount) {
				projectContainer.classList.remove('loading');
				projectContainer.classList.add('loaded', 'playing');
				playPause();
			}
		};
		image.src = tlProject.imgSet[i].filepath;
	}
}

function showSlide(index) {
	const currentImage = tlProject.imgSet[index];
	console.log("current image path: " + currentImage.filepath);
	slideImage.src = "/"+currentImage.filepath;
	slideFilename.textContent = currentImage.filename;
}

function nextSlide() {
	currentIndex = (currentIndex + 1) % imageCount;
	showSlide(currentIndex);
}

function previousSlide() {
	currentIndex = (currentIndex - 1 + imageCount) % imageCount;
	showSlide(currentIndex);
}

function playPause() {
	if (loadedCount === imageCount) {
		if (isPlaying) {
			clearInterval(slideshowInterval);
			isPlaying = false;
			projectContainer.classList.remove('playing');
		} else {
			slideshowInterval = setInterval(nextSlide, 150);
			isPlaying = true;
			projectContainer.classList.add('playing');
		}
	} else {
		preloadImages();
	}
}