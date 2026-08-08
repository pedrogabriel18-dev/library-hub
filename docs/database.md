# Modelo do Banco de Dados — LibraryHub

O **LibraryHub** utiliza o **Prisma ORM** integrado ao banco de dados relacional **SQLite** em ambiente de produção e desenvolvimento.

---

## 📊 Diagrama Entidade-Relacionamento (ER)

```mermaid
erDiagram
    User ||--o{ Review : "escreve"
    User ||--o{ ReadingProgress : "possui"
    User ||--o{ Favorite : "salva"
    User ||--o{ Log : "gera"
    User ||--o{ TCC : "orienta"

    Category ||--o{ Book : "categoriza"
    Category ||--o{ TCC : "categoriza"

    Book ||--o{ BookAuthor : "possui"
    Author ||--o{ BookAuthor : "escreve"
    Book ||--o{ Review : "recebe"
    Book ||--o{ ReadingProgress : "registra"
    Book ||--o{ Favorite : "contém"

    Author ||--o{ TCC : "publica"

    User {
        string id PK
        string login UK
        string name
        string role
        string avatarId
        boolean mustChangePassword
        boolean isActive
    }

    Book {
        string id PK
        string title
        string slug UK
        string synopsis
        string filePath
        string coverImage
        float avgRating
        int downloadCount
        int viewCount
    }

    TCC {
        string id PK
        string title
        string slug UK
        string abstract
        string filePath
        int year
        string course
        int viewCount
    }
```
