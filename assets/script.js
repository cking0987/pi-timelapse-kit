const projects = [];

class Project {
  constructor(name) { 
		this.name = name;
		this.imgSet = [];
		this.currentIndex= 0;
		this.isPlaying = false;
	}
	addImageToProject(image) {
    this.imgSet.push(image);
  }
	calculateProjectMeta() {
		this.nFrames = this.imgSet.length;
		this.startDate = this.imgSet[0].dateStr;
		this.endDate = this.imgSet[this.imgSet.length - 1].dateStr;
		const durationInMs = new Date(this.endDate) - new Date(this.startDate);
		this.durationInDays = durationInMs / ( 1000 * 60 * 60 * 24 );
	}
	addProjectToDOM() {
		const projectEl = `
			<div class="project-container initial" id="project-${this.name}">
				<div class="project-meta">
					<div id="project-name" class="meta-property">
						<div class="label">project name:</div><div class="value">${this.name}</div>
					</div>
					<div id="start" class="meta-property">
						<div class="label">start:</div><div class="value">${this.startDate}</div>
					</div>
					<div id="end" class="meta-property">
						<div class="label">end:</div><div class="value">${this.endDate}</div>
					</div>
					<div id="duration" class="meta-property">
						<div class="label">duration:</div><div class="value">${this.durationInDays} days</div>
					</div>
					<div id="frames" class="meta-property">
						<div class="label">frames:</div><div class="value">${this.nFrames}</div>
					</div>
				</div>
				<div class="slideshow-container" id="slideshow-${this.name}">
					<figure>
						<img src="${this.imgSet[0].filepath}" class="slide-img" id="img-${this.name}" alt="An image in a timelapse slideshow. The project name is ${this.name}">
						<figcaption class="slide-name" id="cap-${this.name}">${this.imgSet[0].filename}</figcaption>
					</figure>
					<div class="ring">Loading
						<span></span>
					</div>
				</div>
				<div class="project-controls">
					<button class="playpause" onClick="clickPlayPause('${this.name}')">play/pause</button> | 
					<button class="prev" onClick="clickPrev('${this.name}')">prev</button> | 
					<button class="next" onClick="clickNext('${this.name}')">next</button> | 
					<button class="go-to-start" onClick="clickFirst('${this.name}')">first</button> | 
					<button class="go-to-last" onClick="clickLast('${this.name}')">last</button>
				</div>
			</div>
		`;
		document.getElementById('projects-container').innerHTML += projectEl;
		this.preloadImages();
	}
	preloadImages() {
    this.imgSet.forEach((image) => {
      let imgElement = new Image();
      imgElement.src = image.filepath;
    });
  }
	nextSlide() {
		if (this.currentIndex < (this.nFrames -1)) {
			this.currentIndex++;
  		this.showSlide(this.currentIndex);
		} else {
			clearInterval(this.nextInterval);
			this.isPlaying = false;
		}
	}
	prevSlide() {
		if (this.currentIndex > 0) {
			this.currentIndex--;
			this.showSlide(this.currentIndex);
		}
	}
	showSlide(index) {
		let imgEl = document.getElementById('img-' + this.name);
		let capEl = document.getElementById('cap-' + this.name);
		let currentImage = this.imgSet[index];
		imgEl.src = currentImage.filepath;
		capEl.textContent = currentImage.filename;
	}
	playPause() {
		if (this.isPlaying) {
			clearInterval(this.nextInterval);
			this.isPlaying = false;
		} else {
			this.nextInterval = setInterval(() => this.nextSlide(), 100);
			this.isPlaying = true;
		}
	}
	goToStart() {
		this.currentIndex = 0;
		this.showSlide(0);
	}
	goToLast() {
		this.currentIndex = (this.nFrames - 1);
		this.showSlide(this.currentIndex);
	}
};

function clickNext(projectName) {
	let project = projects.find((proj) => proj.name === projectName);
	if (project) {
		project.nextSlide();
	}
}
function clickPrev(projectName) {
	let project = projects.find((proj) => proj.name === projectName);
	if (project) {
		project.prevSlide();
	}
}
function clickPlayPause(projectName) {
	let project = projects.find((proj) => proj.name === projectName);
	if (project) {
		project.playPause();
	}
}
function clickFirst(projectName) {
	let project = projects.find((proj) => proj.name === projectName);
	if (project) {
		project.goToStart();
	}
}
function clickLast(projectName) {
	let project = projects.find((proj) => proj.name === projectName);
	if (project) {
		project.goToLast();
	}
}

function getImages() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/load_images_1080.php', true);
  xhr.onload = function () {
    if (this.status == 200) {
      var images = JSON.parse(this.responseText);
			parseImageList(images);
    }
  };
  xhr.send();
}

function parseImageList(images) {
	// we expect an array of file paths that look like this
	// img/pinus-strobus_2023-05-25_1800.webp
	for (let i = 0; i < images.length; i++) {
		let img = {};
		img.filepath = images[i];
		img.filename = img.filepath.split('/')[1];
		img.dateStr = img.filename.split('_')[1];
		img.timeStr = img.filename.split('_')[2].split('.')[0];
		let projName = images[i].split('/')[1].split('_')[0];
		let project = projects.find((proj) => proj.name === projName);
		if (!project) {
			project = new Project(projName);
			projects.push(project);
		}
		project.addImageToProject(img);
	};
	// once all the individual images have been parsed,
	// calculate aggregate data about the projects themselves, 
	// then add the project to the DOM
	projects.forEach((project) => {
		project.calculateProjectMeta();
		project.addProjectToDOM();
	});
}

getImages();