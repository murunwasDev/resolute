package cron

import (
	"database/sql"
	"encoding/json"
	"log"
	"time"

	"github.com/vitwit/resolute/server/clients/coingecko"
	"github.com/vitwit/resolute/server/config"
	"github.com/vitwit/resolute/server/schema"
	"github.com/vitwit/resolute/server/utils"

	"github.com/robfig/cron"
)

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price"

// Cron wraps all required parameters to create cron jobs
type Cron struct {
	cfg config.Config
	db  *sql.DB
}

// NewCron sets necessary config and clients to begin jobs
func NewCron(cfg config.Config, db *sql.DB) *Cron {
	return &Cron{cfg, db}
}

// Start starts to create cron jobs which fetches chosen asset list information and
// store them in database every hour and every 24 hours.
func (c *Cron) Start() error {
	log.Println("Starting cron jobs...")

	cron := cron.New()

	// Every 15 minute
	cron.AddFunc("15 * * * * *", func() {
		c.CoinsPriceInfoList()
		log.Println("successfully saved price information list")
	})

	go cron.Start()

	return nil
}

// CoinsPriceInfoList fetches tokens information list and save its price
func (c *Cron) CoinsPriceInfoList() {
	rows, err := c.db.Query(`SELECT denom,coingecko_name FROM price_info WHERE enabled=$1`, true)
	if err != nil {
		if rows != nil && sql.ErrNoRows == rows.Err() {
			utils.InfoLogger.Println("no coin info in database")
		}
	}

	coinIds := make([]string, 0)
	coinNameToDenom := make(map[string]string, 0)

	for rows.Next() {
		var priceInfo schema.PriceInfo
		if err := rows.Scan(
			&priceInfo.Denom,
			&priceInfo.CoingeckoName,
		); err != nil {
			utils.ErrorLogger.Printf("failed to fetch coin information %s\n", err.Error())
		}

		coinIds = append(coinIds, priceInfo.CoingeckoName)

		coinNameToDenom[priceInfo.CoingeckoName] = priceInfo.Denom
	}

	if len(coinIds) > 0 {
		client1 := coingecko.NewClient(c.cfg.COINGECKO.URI, []string{"usd"})

		priceInfo, err := client1.GetPrice(coinIds)
		if err != nil {
			utils.ErrorLogger.Printf("failed to fetch price information %s\n", err.Error())
		}

		for k, v := range priceInfo {
			val, _ := json.Marshal(v)
			_, err = c.db.Exec("UPDATE price_info SET info=$1,last_updated=$2 WHERE denom=$3", val, time.Now(), coinNameToDenom[k])
			if err != nil {
				utils.ErrorLogger.Printf("failed to update price information for denom = %s : %s\n", k, err.Error())
			}
		}
	}
}
