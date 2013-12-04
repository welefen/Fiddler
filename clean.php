<?php
$file = "output/Fiddler/manifest.json";
$content = file_get_contents($file);
$data = json_decode($content, true);
unset($data["plugins"]);
unset($data["update_url"]);
$content = json_encode($data);
file_put_contents($file, $content);
