import React, { useContext, useState, useEffect } from 'react';
import './Pricing2.scss';
import { useCurrency } from '../../CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { Star } from '@mui/icons-material';

// Base prices in KES (matching the plans)
const BASE_PRICES = {
    silver: 250,
    gold: 850,
    platinum: 3000
};

export default function Pricing2() {
    const navigate = useNavigate();
    const { 
        selectedCountry, 
        setSelectedCountry, 
        showCountrySelector, 
        setShowCountrySelector,
        userCountry,
        convertPrice,
        getSymbol,
        getCurrencyCode,
        getCountries,
        isLoadingRate,
        symbol,
        currency
    } = useCurrency();
    
    const [convertedPrices, setConvertedPrices] = useState({
        silver: 250,
        gold: 850,
        platinum: 3000
    });

    // Convert prices when country changes
    useEffect(() => {
        const rate = getCountries()[selectedCountry]?.rate || 1;
        setConvertedPrices({
            silver: Math.round(BASE_PRICES.silver * rate),
            gold: Math.round(BASE_PRICES.gold * rate),
            platinum: Math.round(BASE_PRICES.platinum * rate)
        });
    }, [selectedCountry]);

    const handleClick = (price) => {
        // Convert the selected price back to KES for consistency
        const rate = getCountries()[selectedCountry]?.rate || 1;
        const priceInKES = Math.round(price / rate);
        // You can set price here if needed
        navigate('/pay');
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
        const planKey = data.title.toLowerCase();
        const convertedPrice = convertedPrices[planKey] || data.price;
        const currencySymbol = getSymbol();
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

    const countries = getCountries();

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
                        {getCurrencyCode()} ({getSymbol()})
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