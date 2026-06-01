import React, { useContext, useEffect, useState } from "react";
import { getAllTips } from "../firebase";
import AppHelmet from "../components/AppHelmet";
import Flyer from "../components/Flyer/Flyer";
import { NavLink } from "react-router-dom";
import Testimonials from "../components/Testimonials/Testimonials";
import { PriceContext } from "../PriceContext";
import { Error, Verified } from "@mui/icons-material";
import Pricing2 from "../components/Pricing/Pricing2";
import Tips from "./Tips";

export default function Home({ userData }) {
	const [loading, setLoading] = useState(false);
	const [allTips, setAllTips] = useState(null);
	const [filteredTips, setFilteredTips] = useState(null);
	const { setPrice } = useContext(PriceContext);
	const [status, setStatus] = useState(true);
	const [isOnline] = useState(() => {
		return navigator.onLine;
	});
	const [visibleTips, setVisibleTips] = useState(4); // Number of tips to show initially
	const tipsPerPage = 4; // Tips to load each time

	useEffect(() => {
		getAllTips(setAllTips, setLoading);
	}, [isOnline]);

	useEffect(() => {
		loading &&
			setTimeout(() => {
				setLoading(false);
			}, 2000);
	}, [loading]);

	useEffect(() => {
		if (allTips !== null) {
			const groupedData = allTips.reduce((acc, item) => {
				const dateKey = item.date;
				if (!acc[dateKey]) {
					acc[dateKey] = [];
				}
				acc[dateKey].push(item);
				return acc;
			}, {});

			const result = Object.keys(groupedData)
				.map((date) => ({
					date,
					items: groupedData[date],
				}))
				.sort((a, b) => new Date(b.date) - new Date(a.date));
			setFilteredTips(result);
		}
	}, [allTips]);

	// Function to load more tips
	const loadMoreTips = () => {
		setVisibleTips((prevVisibleTips) => prevVisibleTips + tipsPerPage);
	};

	// Filter and slice the tips to show only the visible ones
	const getVisibleTips = () => {
		if (!filteredTips) return [];

		return filteredTips
			.map((filteredTip) => {
				const filteredItems = filteredTip.items.filter(
					(tip) => tip.status === "finished" && tip.premium === status
				);

				return {
					...filteredTip,
					items: filteredItems,
				};
			})
			.filter((filteredTip) => filteredTip.items.length > 0)
			.slice(0, visibleTips);
	};

	const visibleFilteredTips = getVisibleTips();
	const hasMoreTips =
		filteredTips &&
		filteredTips.filter(
			(filteredTip) =>
				filteredTip.items.filter(
					(tip) => tip.status === "finished" && tip.premium === status
				).length > visibleTips
		);

	return (
		<div className="Home">
			<AppHelmet title={"Home"} location={""} />
			<section>
				<Tips userData={userData} />
			</section>
			<section>
				<h1>Pricing</h1>
				<h2>Get VIP Membership</h2>
				<Pricing2 />
			</section>
			<section className="tables">
				{filteredTips && filteredTips.length > 0 && (
					<>
						<h1>WINNING HISTORY</h1>
						<span className="btn-holder">
							<div
								className={`btn ${!status && "selected"}`}
								onClick={(e) => {
									setStatus(false);
									setVisibleTips(3);
								}}
							>
								Free Tips
							</div>
							<div
								className={`btn ${status && "selected"}`}
								onClick={() => {
									setStatus(true);
									setVisibleTips(3);
								}}
							>
								Premium VIP
							</div>
						</span>
					</>
				)}
				{visibleFilteredTips.map((filteredTip) => {
					return (
						<React.Fragment key={filteredTip.date}>
							<h2>{filteredTip.date}</h2>
							<div className="card-container">
								{filteredTip.items.map((tip) => (
									<div
										className="tip-card"
										key={tip.id || filteredTip.items.indexOf(tip)}
									>
										<div className="card-header">
											<span className="matchup">
												<span>{`${tip.home}`}</span>
												<span className="vs">vs</span>
												<span> {`${tip.away}`}</span>
											</span>
										</div>

										<div className="card-body">
											<div className="card-row result">
												<span>
													<span>﹫</span>
													<span className="pick">{tip.odd}</span>
												</span>
												<span>
													<span>Tip:</span>
													<span className="pick">{tip.pick}</span>
												</span>

												<span>
													<span>⏱️</span>
													<span className="time">{tip.time}</span>
												</span>
												<span>
													{tip.won === "won" ? (
														<span className="won pick">
															<span>{tip.results}</span>
															<Verified className="icon pick" />
														</span>
													) : tip.status === "pending" ? (
														<span className="pick">?-?</span>
													) : (
														<span className="lost pick">
															<span>{tip.results}</span>
															<Error className="icon pick" />
														</span>
													)}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</React.Fragment>
					);
				})}

				{hasMoreTips && (
					<div style={{ textAlign: "center", margin: "20px 0" }}>
						<button className="btn load-more" onClick={loadMoreTips}>
							Load More
						</button>
					</div>
				)}
			</section>

			<section>
				<Testimonials />
			</section>
			<Flyer />
		</div>
	);
}
