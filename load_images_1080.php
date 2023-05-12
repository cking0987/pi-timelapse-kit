<?php

// Path to the 1080 resized directory
$destinationDir = 'img-1080/';

// Get the list of resized WebP images in the directory
$newFiles = glob($destinationDir . '*.webp');

$newImages = array();

foreach ($newFiles as $file) {
    $newImages[] = $file;
}

sort($newImages);

echo json_encode($newImages);
?>
