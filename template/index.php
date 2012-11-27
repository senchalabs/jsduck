<?php

header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true ");
header("Access-Control-Allow-Methods: OPTIONS, GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control");

function print_page($subtitle, $body, $fragment) {
  $uri = 'http://' . $_SERVER["HTTP_HOST"] . preg_replace('/(index.php)?\?.*$/', '', $_SERVER["REQUEST_URI"]);
  $canonical = $uri."#!".$fragment;
  $html = file_get_contents('print-template.html');
  echo preg_replace(array('/\{subtitle}/', '/\{body}/', '/\{canonical}/'), array($subtitle, $body, $canonical), $html);
}

function print_index_page() {
  echo file_get_contents("template.html");
}

function jsonp_decode($jsonp) {
  $jsonp = preg_replace('/^.*?\(/', "", $jsonp);
  $jsonp = preg_replace('/\);\s*$/', "", $jsonp);
  return json_decode($jsonp, true);
}

function decode_file($filename) {
  if (file_exists($filename)) {
    return jsonp_decode(file_get_contents($filename));
  }
  else {
    throw new Exception("File $filename not found");
  }
}

if (isset($_GET["_escaped_fragment_"]) || isset($_GET["print"])) {
  $fragment = isset($_GET["_escaped_fragment_"]) ? $_GET["_escaped_fragment_"] : $_GET["print"];
  try {
    if (preg_match('/^\/api\/([^-]+)/', $fragment, $m)) {
      $className = $m[1];
      $json = decode_file("output/".$className.".js");
      print_page($className, "<h1>" . $className . "</h1>\n" . $json["html"], $fragment);
    }
    elseif (preg_match('/^\/api\/?$/', $fragment, $m)) {
      print_index_page();
    }
    elseif (preg_match('/^\/guide\/(.+?)(-section-[0-9]+)?$/', $fragment, $m)) {
      $json = decode_file("guides/".$m[1]."/README.js");
      print_page($json["title"], '<div class="guide-container" style="padding: 1px">' . $json["guide"] . '</div>', $fragment);
    }
    elseif (preg_match('/^\/guide\/?$/', $fragment, $m)) {
      print_index_page();
    }
    else {
      print_index_page();
    }
  }
  catch (Exception $e) {
    print_page($e->getMessage(), $e->getMessage(), $fragment);
  }
}
else {
  print_index_page();
}

?>
