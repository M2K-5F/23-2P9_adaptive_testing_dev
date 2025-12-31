package main

import (
	"analtesting/src/core/domain/entities"
	"analtesting/src/infrastructure/persistence/conf/models"
	"analtesting/src/infrastructure/persistence/repositories"
	"context"
	"encoding/json"
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "host=localhost user=postgres password=postgres dbname=aeroline port=5433 sslmode=disable"
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		FullSaveAssociations: false,
	})
	if err != nil {
		panic(err)
	}
	ctx := context.Background()

	database.AutoMigrate(&models.User{}, &models.Role{})

	userRep := repositories.GetUserRepo(ctx, database)
	user, err := userRep.Create(&entities.UserData{
		UserName:     "penis",
		Name:         "penis",
		PasswordHash: "12345",
		Roles:        []entities.UserRoles{entities.AdminRole},
		TelegramLink: "12232421",
	})

	if err != nil {
		panic(err)
	}

	user.Roles = []entities.UserRoles{entities.CustomerRole}
	userRep.Update(user)

	refreshuser, err := userRep.GetByID(user.ID)
	jsonUser, err := json.Marshal(refreshuser)
	fmt.Println(string(jsonUser))
}
