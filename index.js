console.log("jointtt")
const API_KEY = "SKY0DBRTITR20BWZ"; // Replace with your Alpha Vantage API key
        const stockSymbolInput = document.getElementById('stockInput');
        let currentRSI = null;
        let lastPrice = null;
        let rsiCrossed30 = false; // Flag to track if RSI crossed 30
        let rsiLastChecked = null; // Last checked RSI to compare if it's increasing or decreasing
        let lossThreshold = 0.02; // 2% loss threshold for exit condition

        // Function to fetch RSI from Alpha Vantage API
        function getRSI() {
            const stockSymbol = stockSymbolInput.value.trim().toUpperCase();
            if (stockSymbol === "") {
                alert("Please enter a stock symbol.");
                return;
            }

            const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}.BSE&outputsize=full&apikey=${API_KEY}`;
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data["Time Series (5min)"]) {
                        const timeSeries = data["Time Series (1min)"];
                        const latestTime = Object.keys(timeSeries)[0];
                        const latestClose = parseFloat(timeSeries[latestTime]["4. close"]);
                        
                        // Get the latest RSI value
                        currentRSI = parseFloat(data["Technical Analysis: RSI"][latestTime]["RSI"]);
                        const rsiElement = document.getElementById("rsi");
                        const analysisElement = document.getElementById("analysis");

                        rsiElement.textContent = currentRSI.toFixed(2) + "%"; // Display the RSI

                        // BUY condition: RSI is above 30
                        if (currentRSI > 30) {
                            document.getElementById("indicate").textContent = "Buy";
                            document.getElementById("indicatorIcon").className = "bi bi-arrow-up-circle-fill";
                            document.getElementById("indicatorIcon").style.color = "green";

                            // Track the price at which the stock was bought
                            if (!rsiCrossed30) {
                                lastPrice = latestClose; // Set the initial price at which we bought the stock
                                rsiCrossed30 = true; // Mark that we crossed the 30% RSI level
                            }
                        }

                        // SELL condition: RSI is less than 70
                        if (currentRSI < 70) {
                            document.getElementById("indicate").textContent = "Sell";
                            document.getElementById("indicatorIcon").className = "bi bi-arrow-down-circle-fill";
                            document.getElementById("indicatorIcon").style.color = "red";
                        }

                        // EXIST condition: RSI reached or exceeded 70
                        if (currentRSI >= 70) {
                            document.getElementById("indicate").textContent = "EXIST";
                            document.getElementById("indicatorIcon").className = "bi bi-x-circle-fill";
                            document.getElementById("indicatorIcon").style.color = "purple";
                        }

                        // SNF condition: RSI between 30% and 70% and hasn't increased since crossing 30%
                        if (currentRSI > 30 && currentRSI < 70) {
                            if (rsiCrossed30 && currentRSI <= rsiLastChecked) {
                                document.getElementById("indicate").textContent = "SNF";
                                document.getElementById("indicatorIcon").className = "bi bi-slash-circle";
                                document.getElementById("indicatorIcon").style.color = "gray";
                            }
                        }

                        // Loss condition: Stock drops by 2% after buy
                        if (rsiCrossed30 && lastPrice && latestClose < lastPrice * (1 - lossThreshold)) {
                            analysisElement.textContent = "Price has dropped 2% since buy. Consider exiting!";
                        }

                        // Analysis message for RSI crossing 30% downward
                        if (currentRSI < 30 && !rsiCrossed30) {
                            analysisElement.textContent = "RSI crossed below 30%. Be cautious!";
                        }

                        // Store last checked RSI for comparison
                        rsiLastChecked = currentRSI;

                    } else {
                        alert("Could not retrieve data. Please check the stock symbol.");
                    }
                })
                .catch(error => alert("Error fetching data: " + error));
        }

        // Update RSI every 60 seconds
        setInterval(getRSI, 60000); // Auto-update every minute