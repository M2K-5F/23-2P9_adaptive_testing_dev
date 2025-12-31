package interfaces

type TelegramLinkValidator interface {
	CheckLinkValid(link string) error
}
