package api

import (
	"log"
	"net/http"
	"nodelinx-training/backend/model"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
)

func (env Env) CheckUserCredentials(username string, password string) (bool, error) {
	query := `SELECT username FROM users WHERE username = $1 AND password = $2;`
	rows, err := env.DB.Query(query, username, password)
	if err != nil {
		defer rows.Close()
		log.Println("Internal database server error")
		return false, err
	}

	defer rows.Close()
	username2 := ""
	for rows.Next() {
		err = rows.Scan(&username2)
		if err != nil {
			log.Printf("Error reading the database rows: %v", err)
			break
		}
	}

	if username2 != "" && username2 == username {
		return true, nil
	}

	return false, nil
}

func (env Env) Authenticator(c *gin.Context) (interface{}, error) {
	var loginVals model.Login
	if err := c.ShouldBind(&loginVals); err != nil {
		return "", jwt.ErrMissingLoginValues
	}
	username := loginVals.Username
	password := loginVals.Password

	isUserCredentialsValid, _ := env.CheckUserCredentials(username, password)

	if !isUserCredentialsValid {
		return nil, jwt.ErrFailedAuthentication
	}

	return &model.User{
		Username: username,
	}, nil
}

func (env Env) Authorizator(data interface{}, c *gin.Context) bool {
	// v, ok := data.(*model.User)
	// if !ok {
	// 	return false
	// }

	// isUserValid, _ := env.CheckUserId(v.Username)
	// return isUserValid

	// Assume no access control
	return true
}

func (env Env) GetUsers(c *gin.Context) {
	query := `SELECT username FROM users ORDER BY id ASC;`
	rows, err := env.DB.Query(query)
	if err != nil {
		defer rows.Close()
		log.Println("Internal database server error")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	defer rows.Close()
	users := make([]string, 0)
	var user string
	for rows.Next() {
		err = rows.Scan(&user)
		if err != nil {
			log.Printf("Error reading the database rows: %v", err)
			break
		}
		users = append(users, user)
	}

	c.JSON(http.StatusOK, users)
}
