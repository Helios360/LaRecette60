<?php

namespace App\Model;

use PDO;

final class UserRepository{
    public function __construct( private Database $database){}

    private function pdo(): PDO { return $this->database->pdo(); }

    public function findById(int $id): ?UserModel{
        $sql = "SELECT * FROM Users WHERE id = :id LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) return null;
        return UserModel::fromArray($row);
    }

    public function findByEmail(string $email): ?UserModel{
        $sql = "SELECT * FROM Users WHERE email = :email LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':email', $email, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) return null;
        return UserModel::fromArray($row);
    }

    public function create(UserModel $user): UserModel{
        $sql = "INSERT INTO User (email, name, fname, phone, password_hash, role) VALUES (:email, :name, :fname, :phone, :password_hash, :role)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':email' => $user->getEmail(),
            ':name' => $user->getName(),
            ':fname' => $user->getFname(),
            ':phone' => $user->getPhone(),
            ':password_hash' => $user->getPasswordHash(),
            ':role' => $user->getRole(),
        ]);
        
    }
}