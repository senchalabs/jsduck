<?php

function format_members($title, $type, $members) {
  $html = '<div id="m-' . $type . '"><div class="definedBy">Defined By</div>';
  $html .=   '<h3 class="members-title">' . $title . '</h3>';
  $html .=   '<div class="subsection">';
  foreach ($members as $idx => $property) {
    $html .= '<div id="' . $property["tagname"] . '-' . $property["name"] . '" class="member open' . ($idx == 0 ? ' first-child' : '') . '">';
    $html .= '  <a class="side expandable"><span>&nbsp;</span></a>';
    $html .= '  <div class="title">';
    $html .= '    <div class="meta">';
    $html .= '      <a href="#!/api/' . $property["owner"] . '" class="definedIn">' . $property["owner"] . '</a>';
    $html .= '    </div>';
    $html .= '    <a href="#!/api/' . $property["owner"] . '-' . $property["tagname"] . '-' . $property["name"] . '" class="name">';
    $html .=        $property["name"];
    $html .=     '</a><span> : ' . $property["params"] . '</span>';
    $html .= '  </div>';
    $html .= '  <div class="description long">' . $property["doc"] . '</div>';
    $html .= '</div>';
  }
  $html .=   '</div>';
  $html .= '</div>';
  return $html;
}

function format_class($cls) {
  $html = "<h1>" . $cls["name"] . "</h1>";
  $html .= $cls["doc"];
  $html .= '<div class="members">';

  $sections = array(
    "cfg" => "Configs",
    "property" => "Properties",
    "method" => "Methods",
    "event" => "Events",
  );
  foreach ($sections as $key => $title) {
    if ($cls["members"][$key]) {
      $html .= format_members("Instance ".$title, $key, $cls["members"][$key]);
    }
    if ($cls["statics"][$key]) {
      $html .= format_members("Static ".$title, $key, $cls["statics"][$key]);
    }
  }

  $html .= '</div>';
  return $html;
}

function print_page($title, $body) {
  $html = file_get_contents('print-template.html');
  echo preg_replace(array('/\{title}/', '/\{body}/'), array($title, $body), $html);
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
  $fragment = $_GET["_escaped_fragment_"] ? $_GET["_escaped_fragment_"] : $_GET["print"];
  try {
    if (preg_match('/^\/api\/([^-]+)/', $fragment, $m)) {
      $json = decode_file("output/".$m[1].".js");
      print_page($json["name"], format_class($json));
    }
    elseif (preg_match('/^\/api\/?$/', $fragment, $m)) {
      print_index_page();
    }
    elseif (preg_match('/^\/guide\/(.+)/', $fragment, $m)) {
      $json = decode_file("guides/".$m[1]."/README.js");
      print_page($json["title"], '<div id="guide" style="padding: 1px">' . $json["guide"] . '</div>');
    }
    elseif (preg_match('/^\/guide\/?$/', $fragment, $m)) {
      print_index_page();
    }
    else {
      print_page("Not implemented", "<p>Support for <code>$fragment</code> not implemented.</p>");
    }
  }
  catch (Exception $e) {
    print_page($e->getMessage(), $e->getMessage());
  }
}
else {
  print_index_page();
}

?>