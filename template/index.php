<?php

function print_page($title, $body) {
  echo "<!DOCTYPE html>";
  echo "<html>";
  echo "<head>";
  echo "<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />";
  echo "<title>$title</title>";
  echo "</head>";
  echo "<body>";
  echo "<h1>$title</h1>";
  echo $body;
  echo "</body>";
  echo "</html>";
}

if (isset($_GET["_escaped_fragment_"])) {
  $fragment = $_GET["_escaped_fragment_"];
  if (preg_match('/^\/api\/([^-]*)/', $fragment, $m)) {
    $contents = file_get_contents("output/".$m[1].".js");
    $contents = preg_replace('/^.*?\(/', "", $contents);
    $contents = preg_replace('/\);\s*$/', "", $contents);
    $json = json_decode($contents, true);
    print_page($json["name"], $json["doc"]);
  }
  else {
    echo "Not implemented";
  }
}
else {
  echo file_get_contents("template.html");
}

?>