package usecases

import (
	dtos "analtesting/src/core/application/DTOs"
	"analtesting/src/core/application/interfaces"
	"analtesting/src/core/domain/entities"
)

type CreateUserUC struct {
	UserRepository interfaces.UserRepository
	PasswordHasher interfaces.PasswordHasher
	LinkValidator  interfaces.TelegramLinkValidator
}

func (this CreateUserUC) Execute(UserData *dtos.CreateUserDTO) (*entities.User, error) {
	if err := this.LinkValidator.CheckLinkValid(UserData.TelegramLink); err != nil {
		return nil, err
	}

	HashedPWD, err := this.PasswordHasher.Hash(UserData.Password)

	if err != nil {
		return nil, err
	}

	createdUser, err := this.UserRepository.Create(
		&entities.UserData{
			UserName:     UserData.UserName,
			Name:         UserData.Name,
			TelegramLink: UserData.TelegramLink,
			PasswordHash: HashedPWD,
			Roles:        UserData.Roles,
		},
	)

	if err != nil {
		return nil, err
	}

	return createdUser, nil
}
