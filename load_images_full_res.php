<?php

$dir = 'img/';
$files = scandir($dir);
$images = array();

foreach ($files as $file) {
    if (in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), array('jpg', 'jpeg', 'png', 'gif'))) {
        $images[] = $dir . $file;
    }
}

sort($images);

echo json_encode($images);

?>