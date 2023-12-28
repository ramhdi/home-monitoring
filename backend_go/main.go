package main

import (
	"log"
	"net/http"
	"nodelinx-training/backend/api"
	"nodelinx-training/backend/model"
	"time"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	_ "github.com/lib/pq"
)

var identityKey = "username"

func main() {
	// Init DB
	env := new(api.Env)
	db, err := api.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to start the server: %v", err)
	}
	env.DB = db

	// Init Gin
	router := gin.Default()

	// Init CORS Middleware
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:4242"}
	corsConfig.AllowCredentials = true
	corsConfig.AddAllowMethods("OPTIONS")

	router.Use(cors.New(corsConfig))

	// Init JWT Middleware
	authMiddleware, err := jwt.New(&jwt.GinJWTMiddleware{
		Realm:       "test zone",
		Key:         []byte("secret key"),
		Timeout:     time.Hour,
		MaxRefresh:  time.Hour,
		IdentityKey: identityKey,
		PayloadFunc: func(data interface{}) jwt.MapClaims {
			if v, ok := data.(*model.User); ok {
				return jwt.MapClaims{
					identityKey: v.Username,
				}
			}
			return jwt.MapClaims{}
		},
		IdentityHandler: func(c *gin.Context) interface{} {
			claims := jwt.ExtractClaims(c)
			return &model.User{
				Username: claims[identityKey].(string),
			}
		},
		Authenticator: env.Authenticator,
		// Authenticator: func(c *gin.Context) (interface{}, error) {
		// 	var loginVals model.Login
		// 	if err := c.ShouldBind(&loginVals); err != nil {
		// 		return "", jwt.ErrMissingLoginValues
		// 	}
		// 	userID := loginVals.Id

		// 	if userID == "admin" {
		// 		return &model.User{
		// 			Id: userID,
		// 		}, nil
		// 	}

		// 	return nil, jwt.ErrFailedAuthentication
		// },
		Authorizator: env.Authorizator,
		// Authorizator: func(data interface{}, c *gin.Context) bool {
		// 	if v, ok := data.(*model.User); ok && v.Id == "admin" {
		// 		return true
		// 	}

		// 	return false
		// },
		Unauthorized: func(c *gin.Context, code int, message string) {
			c.JSON(code, gin.H{
				"code":    code,
				"message": message,
			})
		},
		// TokenLookup is a string in the form of "<source>:<name>" that is used
		// to extract token from the request.
		// Optional. Default value "header:Authorization".
		// Possible values:
		// - "header:<name>"
		// - "query:<name>"
		// - "cookie:<name>"
		// - "param:<name>"
		TokenLookup: "header: Authorization, query: token, cookie: token",
		// TokenLookup: "query:token",
		// TokenLookup: "cookie:token",

		// TokenHeadName is a string in the header. Default value is "Bearer"
		TokenHeadName: "Bearer",

		// TimeFunc provides the current time. You can override it to use another time value. This is useful for testing or if your server uses a different time zone than your tokens.
		TimeFunc: time.Now,

		// Cookie setting
		SendCookie:     true,
		SecureCookie:   false, //non HTTPS dev environments
		CookieHTTPOnly: true,  // JS can't modify
		CookieDomain:   "localhost:8080",
		CookieName:     "token", // default jwt
		// TokenLookup:    "cookie:token",
		CookieSameSite: http.SameSiteDefaultMode, //SameSiteDefaultMode, SameSiteLaxMode, SameSiteStrictMode, SameSiteNoneMode
	})

	if err != nil {
		log.Fatal("JWT Error:" + err.Error())
	}

	// When you use jwt.New(), the function is already automatically called for checking,
	// which means you don't need to call it again.
	errInit := authMiddleware.MiddlewareInit()

	if errInit != nil {
		log.Fatal("authMiddleware.MiddlewareInit() Error:" + errInit.Error())
	}

	router.POST("/api/login", authMiddleware.LoginHandler)

	router.NoRoute(authMiddleware.MiddlewareFunc(), func(c *gin.Context) {
		claims := jwt.ExtractClaims(c)
		log.Printf("NoRoute claims: %#v\n", claims)
		c.JSON(404, gin.H{"code": "PAGE_NOT_FOUND", "message": "Page not found"})
	})

	auth := router.Group("/api/secure")
	// Refresh time can be longer than token timeout
	// auth.GET("/refresh_token", authMiddleware.RefreshHandler)
	auth.Use(authMiddleware.MiddlewareFunc())
	{
		auth.GET("/hello", func(c *gin.Context) {
			claims := jwt.ExtractClaims(c)
			user, _ := c.Get(identityKey)
			c.JSON(200, gin.H{
				"userID":   claims[identityKey],
				"userName": user.(*model.User).Username,
				"text":     "Hello World.",
			})
		})
		auth.GET("/users", env.GetUsers)
	}

	// Init routes
	// api := router.Group("/api")

	router.Run("localhost:3001")
}
