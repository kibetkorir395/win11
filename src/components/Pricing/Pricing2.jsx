import React, { useContext, useState, useEffect } from 'react';
import './Pricing2.scss';
import { PriceContext } from '../../PriceContext';
import { useNavigate } from 'react-router-dom';
import { Star } from '@mui/icons-material';

// Country configurations with exchange rates
const countries = {
    Nigeria: { code: "NG", currency: "NGN", symbol: "₦", flag: "🇳🇬", rate: 11.63 },
    Kenya: { code: "KE", currency: "KES", symbol: "KSH", flag: "🇰🇪", rate: 1 },
    SouthAfrica: { code: "ZA", currency: "ZAR", symbol: "R", flag: "🇿🇦", rate: 0.22 },
    Ghana: { code: "GH", currency: "GHS", symbol: "₵", flag: "🇬🇭", rate: 0.06 },
    Uganda: { code: "UG", currency: "UGX", symbol: "USh", flag: "🇺🇬", rate: 1.5 },
    Tanzania: { code: "TZ", currency: "TZS", symbol: "TSh", flag: "🇹🇿", rate: 1.15 },
    US: { code: "US", currency: "USD", symbol: "$", flag: "🇺🇸", rate: 0.0077 },
    UK: { code: "GB", currency: "GBP", symbol: "£", flag: "🇬🇧", rate: 0.006 },
};

// Base prices in KES (matching the plans)
const BASE_PRICES = {
    silver: 250,
    gold: 850,
    platinum: 3000
};

export default function Pricing2() {
    const navigate = useNavigate();
    const { setPrice } = useContext(PriceContext);
    const [selectedCountry, setSelectedCountry] = useState("Kenya");
    const [userCountry, setUserCountry] = useState(null);
    const [showCountrySelector, setShowCountrySelector] = useState(false);
    const [convertedPrices, setConvertedPrices] = useState({
        silver: 250,
        gold: 850,
        platinum: 3000
    });
    const [isLoadingRate, setIsLoadingRate] = useState(false);

    // Detect user's country using IP geolocation
    const detectUserCountry = async () => {
        try {
            const response = await fetch("https://ipapi.co/json/");
            if (response.ok) {
                const data = await response.json();
                const countryCode = data.country_code;

                const matchedCountry = Object.entries(countries).find(
                    ([_, config]) => config.code === countryCode
                );

                if (matchedCountry) {
                    setSelectedCountry(matchedCountry[0]);
                    setUserCountry(matchedCountry[0]);
                    return;
                }
            }

            setSelectedCountry("Kenya");
            setUserCountry("Kenya");
        } catch (error) {
            console.error("Error detecting country:", error);
            setSelectedCountry("Kenya");
            setUserCountry("Kenya");
        }
    };

    // Convert prices to selected currency
    const convertPrices = async () => {
        setIsLoadingRate(true);
        try {
            const rate = countries[selectedCountry]?.rate || 1;
            
            setConvertedPrices({
                silver: Math.round(BASE_PRICES.silver * rate),
                gold: Math.round(BASE_PRICES.gold * rate),
                platinum: Math.round(BASE_PRICES.platinum * rate)
            });
        } catch (error) {
            console.error("Error converting prices:", error);
            // Fallback to KES if conversion fails
            setConvertedPrices({
                silver: BASE_PRICES.silver,
                gold: BASE_PRICES.gold,
                platinum: BASE_PRICES.platinum
            });
        } finally {
            setIsLoadingRate(false);
        }
    };

    // Update prices when country changes
    useEffect(() => {
        convertPrices();
    }, [selectedCountry]);

    // Detect user country on component mount
    useEffect(() => {
        detectUserCountry();
    }, []);

    const handleClick = (price) => {
        // Convert the selected price back to KES for consistency
        const rate = countries[selectedCountry]?.rate || 1;
        const priceInKES = Math.round(price / rate);
        setPrice(priceInKES);
        navigate('/pay');
    };

    const getCurrencySymbol = () => {
        return countries[selectedCountry]?.symbol || "KSH";
    };

    const getCurrencyCode = () => {
        return countries[selectedCountry]?.currency || "KES";
    };

    const plans = [
        {
            id: 1,
            title: "Silver",
            price: 250,
            duration: "/Day",
            features: [
                "Every day is game day! Check out our daily tips and win big!",
                "Access 24 hours VIP predictions",
                "Expert Football Predictions"
            ]
        },
        {
            id: 2,
            title: "Gold",
            price: 850,
            duration: "/Week",
            features: [
                "Get the scoop on this week's matches",
                "Enjoy a full week of VIP predictions",
                "Weekly unbeatable football predictions!"
            ]
        },
        {
            id: 3,
            title: "Platinum",
            price: 3000,
            duration: "/Month",
            features: [
                "Plan ahead with our monthly predictions",
                "Get unlimited VIP access for a month",
                "Your winning streak starts here!"
            ]
        }
    ];

    const Item = ({ data }) => {
        // Get converted price for this plan
        const planKey = data.title.toLowerCase();
        const convertedPrice = convertedPrices[planKey] || data.price;
        const currencySymbol = getCurrencySymbol();
        const currencyCode = getCurrencyCode();

        return (
            <div className={`pricing-card ${data.title === 'Gold' ? 'featured' : ''}`} key={data.duration}>
                {data.title === 'Gold' && (
                    <div className="featured-badge">
                        <Star className="star-icon" />
                        <span>Popular</span>
                    </div>
                )}

                <div className="card-header">
                    <h3>{data.title}</h3>
                    <div className="price">
                        <span className="currency">{currencySymbol}</span>
                        <span className="amount">
                            {isLoadingRate ? '...' : convertedPrice.toLocaleString()}
                        </span>
                        <span className="duration">{data.duration}</span>
                        {currencyCode !== "KES" && (
                            <div className="original-price">
                                ≈ KSH {data.price.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card-features">
                    <ul>
                        {data.features.map((item, index) => (
                            <li key={index}>
                                <span className="checkmark">✓</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {currencyCode !== "KES" && (
                    <div className="currency-note">
                        💱 Price shown in {currencyCode}
                    </div>
                )}

                <button
                    className="glass-btn"
                    onClick={() => handleClick(convertedPrice)}
                >
                    Get Started Now
                </button>
            </div>
        );
    };

    return (
        <div className="pricing-container" id='pricing'>
            {/* Country Selector */}
            <div className="pricing-country-selector">
                <div 
                    className="selected-country" 
                    onClick={() => setShowCountrySelector(!showCountrySelector)}
                >
                    <span className="flag">{countries[selectedCountry]?.flag || "🌍"}</span>
                    <span className="country-name">{selectedCountry}</span>
                    <span className="country-currency">
                        {getCurrencyCode()} ({getCurrencySymbol()})
                    </span>
                    <span className="dropdown-arrow">
                        {showCountrySelector ? "▲" : "▼"}
                    </span>
                </div>

                {showCountrySelector && (
                    <div className="country-dropdown">
                        {Object.entries(countries).map(([country, config]) => (
                            <div
                                key={country}
                                className={`country-option ${selectedCountry === country ? "active" : ""}`}
                                onClick={() => {
                                    setSelectedCountry(country);
                                    setShowCountrySelector(false);
                                }}
                            >
                                <span className="flag">{config.flag}</span>
                                <span className="country-name">{country}</span>
                                <span className="currency-code">{config.currency}</span>
                                <span className="currency-symbol">{config.symbol}</span>
                            </div>
                        ))}
                    </div>
                )}

                {userCountry && userCountry !== selectedCountry && (
                    <div className="detected-country">
                        🔍 Detected: {userCountry}
                        <button onClick={() => setSelectedCountry(userCountry)}>
                            Use {userCountry}
                        </button>
                    </div>
                )}
            </div>

            <div className="pricing-grid">
                {plans.map(item => (
                    <Item data={item} key={item.id} />
                ))}
            </div>
        </div>
    );
}