package constants

type AdaptivityProfile struct {
	Name                      AdaptivityProfileName
	QuestionWeight            float64
	LastScore                 float64
	TimeSinceLast             float64
	MaxAdaptiveQuestionsCount int
	MaxAdaptiveQuestionsRatio float64
}

type AdaptivityProfileName string

const (
	AggressiveAdaptivityProfile AdaptivityProfileName = "AGGRESSIVE"
	BalancedAdaptivityProfile   AdaptivityProfileName = "BALANCED"
	GentleAdaptivityProfile     AdaptivityProfileName = "GENTLE"
)

func GetAdaptivityProfile(name AdaptivityProfileName) AdaptivityProfile {
	profiles := map[AdaptivityProfileName]AdaptivityProfile{
		GentleAdaptivityProfile: {
			Name:                      GentleAdaptivityProfile,
			QuestionWeight:            0.5,
			LastScore:                 0.4,
			TimeSinceLast:             0.1,
			MaxAdaptiveQuestionsCount: 3.0,
			MaxAdaptiveQuestionsRatio: 0.2,
		},
		BalancedAdaptivityProfile: {
			Name:                      BalancedAdaptivityProfile,
			QuestionWeight:            0.6,
			LastScore:                 0.3,
			TimeSinceLast:             0.1,
			MaxAdaptiveQuestionsCount: 5.0,
			MaxAdaptiveQuestionsRatio: 0.3,
		},
		AggressiveAdaptivityProfile: {
			Name:                      AggressiveAdaptivityProfile,
			QuestionWeight:            0.7,
			LastScore:                 0.2,
			TimeSinceLast:             0.1,
			MaxAdaptiveQuestionsCount: 8.0,
			MaxAdaptiveQuestionsRatio: 0.4,
		},
	}

	profile := profiles[name]
	return profile
}
