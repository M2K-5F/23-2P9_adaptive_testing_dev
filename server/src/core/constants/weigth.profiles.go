package constants

type WeightProfile struct {
	Name       WeightProfileName
	BaseWeight float64
	BaseStep   float64
	MinWeight  float64
	MaxWeight  float64
	ScoreBias  float64
}

type WeightProfileName string

const (
	AgressiveWeightProfile WeightProfileName = "AGGRESSIVE"
	BalancedWeightProfile  WeightProfileName = "BALANCED"
	GentleWeightProfile    WeightProfileName = "GENTLE"
)

func GetWeightProfile(name WeightProfileName) WeightProfile {
	profiles := map[WeightProfileName]WeightProfile{
		GentleWeightProfile: WeightProfile{
			Name:       GentleWeightProfile,
			BaseWeight: 1.0,
			BaseStep:   0.1,
			MinWeight:  0.5,
			MaxWeight:  2.0,
			ScoreBias:  0.0,
		},
		BalancedWeightProfile: {
			Name:       BalancedWeightProfile,
			BaseWeight: 1.0,
			BaseStep:   0.15,
			MinWeight:  0.3,
			MaxWeight:  3.0,
			ScoreBias:  0.1,
		},
		AgressiveWeightProfile: {
			Name:       AgressiveWeightProfile,
			BaseWeight: 1.0,
			BaseStep:   0.15,
			MinWeight:  0.3,
			MaxWeight:  3.0,
			ScoreBias:  0.1,
		},
	}

	profile := profiles[name]
	return profile
}
