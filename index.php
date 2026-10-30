<?php
// PHP serves the shell; all processing stays in the browser.
header('Content-Type: text/html; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
readfile(__DIR__ . '/index.html');
