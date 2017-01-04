<?php
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true ");
header("Access-Control-Allow-Methods: OPTIONS, GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control");

function print_page($subtitle, $body, $fragment) {
  $uri = 'http://' . $_SERVER["HTTP_HOST"] . preg_replace('/(index.php)?\?.*$/', '', $_SERVER["REQUEST_URI"]);
  $canonical = $uri."#!".$fragment;
  $html = file_get_contents('print-template.html');
  echo preg_replace(array('/\{subtitle}/', '/\{body}/', '/\{canonical}/'), array($subtitle, fix_links($body), $canonical), $html);
}

function print_index_page() {
  echo fix_links(file_get_contents("index-template.html"));
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
    throw new Exception("File ".htmlspecialchars($filename)." not found");
  }
}

// Turns #! links into ?print= links when in print mode.
//
// <a href="#!/api/Ext.Element">  -->  <a href="?print=/api/Ext.Element">
// <a href="#!/api/Ext.Element-cfg-id">  -->  <a href="?print=/api/Ext.Element#cfg-id">
//
function fix_links($html) {
  if (isset($_GET["print"]) || isset($_GET["mobile"])) {
    $param = isset($_GET["print"]) ? "print" : "mobile";
    $patterns = array(
      // regex for apidoc w/ sections
      '/<a (?:class=".+" )href=([\'"])#!?\/(api\/[^-\'"]+?)-([^\'"]+?)/' => '<a href=$1?'.$param.'=/$2#$3',
      // regex for apidocs w/o sections
      '/<a (?:class=".+" )href=([\'"])#!?\/(api\/[^\'"]+?)/' => '<a href=$1?'.$param.'=/$2',
      // regex for markdown guides w/section
      '/<a href=([\'"])#!?\/guide\/([^-\'"]+?)-section-([^\'"]+?)/' => '<a href=$1?'.$param.'=/guide/$2#$2-section-$3',
      // regex for html guides w/ sections
      '/<a class=".+" href=([\'"])#!?\/(guide\/[^-\'"]+?)-section-([^\'"]+?)/' => '<a href=$1?'.$param.'=/$2#$3',
      // regex for guides w/o sections
      '/<a (?:class=".+" )href=([\'"])#!?\/(guide\/[^-\'"]+?)/' => '<a href=$1?'.$param.'=/$2',
      '/<a href=([\'"])#!?\//' => '<a href=$1?'.$param.'=/',
      // workaround for guides not displaying in print toc
      '/display:none/' => ''
    );
    return preg_replace(array_keys($patterns), array_values($patterns), $html);
  }
  else {
    return $html;
  }
}

if (isset($_GET["_escaped_fragment_"]) || isset($_GET["print"]) || isset($_GET["mobile"])) {
  if (isset($_GET["_escaped_fragment_"])) {
    $fragment = $_GET["_escaped_fragment_"];
  }
  elseif (isset($_GET["print"])) {
    $fragment = $_GET["print"];
  }
  elseif (isset($_GET["mobile"])) {
    $fragment = $_GET["mobile"];
  }
  else {
    $fragment = "";
  }

  try {
    if (isset($_GET["_escaped_fragment_"]) && preg_match('/^\/api\/([^-]+)-([^-]+)-(.+)/', $fragment, $m)) {
      $className = $m[1];
      $attrType = $m[2];
      $attrName = $m[3];
      $attribute = $attrType . "-" . $attrName;
      $json = decode_file("output/".$className.".js");
      $doc = new DOMDocument();
      $file = @$doc->loadHTML($json["html"]);
      $divs = $doc->getElementsByTagName('div');
      $content = "";
      foreach ( $divs as $div ) {
        if (!$div->hasAttribute('id')) {
          continue;
        }
        elseif ($div->attributes->getNamedItem('id')->nodeValue == $attribute) {
          $content = "<h1>" . $className . "." . $attrName . "</h1>" . $doc->saveHTML($div);
          break;
        }
      }
      print_page($className, $content, $fragment);
    }
    elseif (preg_match('/^\/api\/([^-]+)/', $fragment, $m)) {
      $className = $m[1];
      $json = decode_file("output/".$className.".js");
      print_page($className, "<h1>" . $className . "</h1>\n" . $json["html"], $fragment);
    }
    elseif (preg_match('/^\/api\/?$/', $fragment, $m)) {
      print_index_page();
    }
    elseif (preg_match('/^\/guide\/(.+?)(-section-.+)?$/', $fragment, $m)) {
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
  echo file_get_contents("template.html");
}

?>
