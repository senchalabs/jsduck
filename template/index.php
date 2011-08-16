<?php

function print_members($title, $type, $members) {
  echo '<div id="m-' . $type . '"><div class="definedBy">Defined By</div>';
  echo   '<h3 class="members-title">' . $title . '</h3>';
  echo   '<div class="subsection">';
  foreach($members as $idx => $property) {
    echo   '<div id="' . $property["tagname"] . '-' . $property["name"] . '" class="member open' . ($idx == 0 ? ' first-child' : '') . '">';
    echo   '  <a class="side expandable"><span>&nbsp;</span></a>';
    echo   '  <div class="title">';
    echo   '    <div class="meta">';
    echo   '      <a href="#!/api/' . $property["owner"] . '" class="definedIn">' . $property["owner"] . '</a>';
    echo   '    </div>';
    echo   '    <a href="#!/api/' . $property["owner"] . '-' . $property["tagname"] . '-' . $property["name"] . '" class="name">';
    echo          $property["name"];
    echo       '</a><span> : ' . $property["params"] . '</span>';
    echo   '  </div>';
    echo   '  <div class="description long">' . $property["doc"] . '</div>';
    echo   '</div>';
  }
  echo   '</div>';
  echo '</div>';
}

function print_page($title, $cls) {
  echo "<!DOCTYPE html>";
  echo '<html>';
  echo "<head>";
  echo "<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />";
  echo "<meta name=\"description\" content=\"Official ExtJS 4.0 API Documentation for $title from Sencha. Examples, guides, screencasts and comments on how to use $title.\" />";
  echo '<link rel="stylesheet" href="resources/css/reset.css" type="text/css" />';
  echo '<link rel="stylesheet" href="resources/css/docs-ext.css" type="text/css" />';
  echo '<link rel="stylesheet" href="resources/css/viewport.css" type="text/css" />';
  echo '<link rel="stylesheet" href="resources/css/print.css" type="text/css" media="print" />';

  echo "<title>$title | Ext JS 4.0 API Docs | Sencha</title>";
  echo "</head>";
  echo '<body>';
  echo '<div id="north-region" style="padding: 1px 0 11px 11px"><div class="logo"><span><a href="http://docs.sencha.com">Sencha Docs</a></span> <a href="http://docs.sencha.com/ext-js/4-0">Ext JS 4.0</a></div></div>';
  echo '<div id="center-container" class="class-overview" style="padding: 20px">';
  echo "<h1>$title</h1>";
  echo $cls["doc"];

  echo '<div class="members">';
  $sections = array(
    "cfg" => "Configs",
    "property" => "Properties",
    "method" => "Methods",
    "event" => "Events",
  );
  foreach ($sections as $key => $title) {
    if ($cls["members"][$key]) {
      print_members("Instance ".$title, $key, $cls["members"][$key]);
    }
    if ($cls["statics"][$key]) {
      print_members("Static ".$title, $key, $cls["statics"][$key]);
    }
  }
  echo '</div>';

  echo '</div>';
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
    print_page($json["name"], $json);
  }
  else {
    echo "Not implemented";
  }
}
else {
  echo file_get_contents("template.html");
}

?>