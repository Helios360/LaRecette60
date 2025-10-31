<?php
declare(strict_types=1);

$HOST = getenv('MYSQL_HOST');
$PORT = getenv('MYSQL_PORT');
$DB_NAME = getenv('MYSQL_DATABASE');
$DB_USER = getenv('MYSQL_USER');
$DB_PASS = getenv('MYSQL_PASSWORD');
$DB_DSN = "mysql:host={$HOST};port={$PORT};dbname={$DB_NAME};charset=utf8mb4;";

try{
    $pdo = new PDO($DB_DSN, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    exit('DB error');
}