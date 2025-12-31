package interfaces

type PasswordHasher interface {
	Hash(password string) (string, error)
	Verify(hash string) error
}
