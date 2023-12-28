package api

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

type Env struct {
	DB *sql.DB
}

// const (
// 	host     = "localhost"
// 	port     = 5432
// 	user     = "postgres"
// 	password = "1234"
// 	dbname   = "home_monitoring"
// )

func ConnectDB() (*sql.DB, error) {
	connString := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname = %s sslmode=disable", host, port, user, password, dbname)
	db, err := sql.Open("postgres", connString)
	if err != nil {
		log.Printf("Failed to connect to database: %v", err)
		return nil, err
	}

	log.Printf("Connected to database")
	return db, nil
}
