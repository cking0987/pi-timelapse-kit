<?php
// Set the maximum width and height for the resized image
$maxWidth = 1080;
$maxHeight = 1080;

// Path to the directory containing the original images
$imageDir = 'img/';

// Path to the directory where resized images will be saved
$destinationDir = 'img-1080/';

// Create the destination directory if it doesn't exist
if (!file_exists($destinationDir)) {
    mkdir($destinationDir, 0777, true);
}

// Get the list of images in the directory
$files = scandir($imageDir);
$images = array();

foreach ($files as $file) {
    if (in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), array('jpg', 'jpeg', 'png', 'gif'))) {
        $images[] = $file;

        // Generate a unique filename for the resized image
        $resizedFilename = $file;
        $resizedImagePath = $destinationDir . pathinfo($file, PATHINFO_FILENAME) . '.webp';

        // Check if the resized image already exists
        if (!file_exists($resizedImagePath)) {
            // Get the original image dimensions
            list($originalWidth, $originalHeight) = getimagesize($imageDir . $file);

            // Calculate the aspect ratio of the original image
            $aspectRatio = $originalWidth / $originalHeight;

            // Calculate the new dimensions while maintaining the aspect ratio
            if ($originalWidth > $maxWidth || $originalHeight > $maxHeight) {
                if ($maxWidth / $maxHeight > $aspectRatio) {
                    $newWidth = $maxHeight * $aspectRatio;
                    $newHeight = $maxHeight;
                } else {
                    $newWidth = $maxWidth;
                    $newHeight = $maxWidth / $aspectRatio;
                }
            } else {
                $newWidth = $originalWidth;
                $newHeight = $originalHeight;
            }

            // Create a new image resource with the desired dimensions
            $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

            // Load the original image
            $originalImage = imagecreatefromjpeg($imageDir . $file);

            // Resize the original image to the new dimensions
            imagecopyresampled(
                $resizedImage, // Destination image resource
                $originalImage, // Source image resource
                0, 0, // Destination x, y coordinates
                0, 0, // Source x, y coordinates
                $newWidth, $newHeight, // Destination width, height
                $originalWidth, $originalHeight // Source width, height
            );

            // Save the resized image to the destination folder in WebP format at 80 quality
            imagewebp($resizedImage, $resizedImagePath, 80);

            // Free up memory
            imagedestroy($originalImage);
            imagedestroy($resizedImage);
        }
    }
}
?>
