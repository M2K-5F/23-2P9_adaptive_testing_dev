package entities

import "time"

type Entity struct {
	ID        uint      `json:"id"`
	CreatedAt time.Time `json:"-"`
}
