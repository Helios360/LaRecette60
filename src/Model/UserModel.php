<?php
declare(strict_types=1);

namespace App\Model;

use App\Model\Database;

final class UserModel {
    public function __construct(
        private int $id,
        private string $email,
        private string $name,
        private string $fname,
        private string $phone,
        private string $passwordHash,
        private int $role,
    ){}

    public static function fromArray(array $row): self {
        return new self( 
           id: (int)($row['id'] ?? 0),
           email: (string)($row['email'] ?? ''),
           name: (string)($row['name'] ?? ''),
           fname: (string)($row['fname'] ?? ''),
           phone: (string)($row['phone'] ?? ''),
           passwordHash: (string)($row['password_hash'] ?? ''),
           role: (int)($row['role'] ?? 0)
        );
    }
    public function getId(): int{ return $this->id;}
    public function getEmail(): string{ return $this->email;}
    public function getName(): string{ return $this->name;}
    public function getFname(): string{ return $this->fname;}
    public function getPhone(): string{ return $this->phone;}
    public function getPasswordHash(): string{ return $this->PasswordHash;}
    public function getRole(): int{ return $this->id;}

}