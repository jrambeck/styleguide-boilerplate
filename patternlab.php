<?php

require_once __DIR__ . '/vendor/autoload.php';

$config = new \Labcoat\Configuration\LabcoatConfiguration(__DIR__ . '/patternlab');

$config->addAssetDirectory(__DIR__ . '/assets');

$patternlab = new \Labcoat\PatternLab($config);
$styleguide = new \Labcoat\Styleguide\Styleguide($patternlab);
print $styleguide->generate(__DIR__ . '/public');
