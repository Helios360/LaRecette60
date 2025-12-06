<?php
declare(strict_types=1);

namespace App\Model;

use PDO;
use PDOException;
use RuntimeException;

final class Database {
    private PDO $pdo;

    public function __construct(
        string $host,
        string $port,
        string $dbName,
        string $user,
        string $password
    ) {
        $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4;";
        try {
            $this->pdo = new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,]);
        } catch (PDOException $e) {
            throw new RuntimeException('Database connection failed', 0, $e);
        }
    }
    
    public static function fromEnv(): self {
        $host = getenv('MYSQL_HOST') ?: "localhost";
        $port = getenv('MYSQL_PORT') ?: "3306";
        $dbName = getenv('MYSQL_DATABASE') ?: "larecette";
        $user = getenv('MYSQL_USER') ?: "user";
        $pass = getenv('MYSQL_PASSWORD') ?: "";
        return new self($host, $port, $dbName, $user, $pass);
    }

    public function pdo(): PDO { return $this->pdo; }
}