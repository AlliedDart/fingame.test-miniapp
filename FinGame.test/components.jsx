// playercart.jsx

import React from "react";

const PlayerCard = ({ player, assets }) => {
  // Считаем стоимость активов
  const totalAssets = Object.entries(player.assets).reduce((sum, [id, qty]) => {
    const asset = assets.find(a => a.id === id);
    return sum + (asset ? asset.price * qty : 0);
  }, 0);

  // Общая стоимость = депозит + стоимость активов
  const totalValue = player.deposit + totalAssets;

  return (
    <div style={{ border: "1px solid gray", padding: "10px", margin: "5px", minWidth: "200px" }}>
      <h3>{player.name}</h3>
      <p>Депозит: ${player.deposit.toFixed(1)}</p>
      <p>Стоимость активов: ${totalAssets.toFixed(1)}</p>
      <p><strong>Общая стоимость: ${totalValue.toFixed(1)}</strong></p>
      <ul>
        {Object.entries(player.assets).map(([id, qty]) => {
          const asset = assets.find(a => a.id === id);
          if (!asset) return null;
          return (
            <li key={id}>
              {asset.name}: {qty.toFixed(1)} × ${asset.price.toFixed(1)} = ${(qty * asset.price).toFixed(1)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PlayerCard;



//dashboard.jsx

import React from "react";
import PlayerCard from "./PlayerCard";

const Dashboard = ({ players, assets }) => {
  // Определяем лидера
  const leader = players.reduce((max, player) => {
    const totalAssets = Object.entries(player.assets).reduce((sum, [id, qty]) => {
      const asset = assets.find(a => a.id === id);
      return sum + (asset ? asset.price * qty : 0);
    }, 0);
    const totalValue = player.deposit + totalAssets;
    return totalValue > max.value ? { player, value: totalValue } : max;
  }, { player: null, value: 0 });

  return (
    <div>
      <h2>Игроки</h2>
      {leader.player && <h3>Лидер: {leader.player.name} (${leader.value.toFixed(1)})</h3>}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {players.map(player => (
          <PlayerCard key={player.id} player={player} assets={assets} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;


//trademodal.jsx


import React, { useState } from "react";

const TradeModal = ({ players, assets, onClose, onApply }) => {
  const [playerId, setPlayerId] = useState(players[0]?.id || 1);
  const [assetId, setAssetId] = useState(assets[0]?.id || "");
  const [amount, setAmount] = useState("");

  const handleApply = (type) => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onApply(playerId, assetId, amt, type);
    setAmount("");
    onClose();
  };

  return (
    <div style={{ border: "1px solid black", padding: "10px", background: "#fff" }}>
      <h3>Сделка</h3>
      <label>Игрок:</label>
      <select value={playerId} onChange={e => setPlayerId(Number(e.target.value))}>
        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <br />
      <label>Актив:</label>
      <select value={assetId} onChange={e => setAssetId(e.target.value)}>
        {assets.map(a => <option key={a.id} value={a.id}>{a.name} (${a.price.toFixed(1)})</option>)}
      </select>
      <br />
      <label>Сумма $:</label>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <br />
      <button onClick={() => handleApply("buy")}>Купить</button>
      <button onClick={() => handleApply("sell")}>Продать</button>
      <button onClick={onClose}>Закрыть</button>
    </div>
  );
};

export default TradeModal;


//luckyblockmodal.jsx


import React, { useState } from "react";

const LuckyBlockModal = ({ players, luckyBlocks, onClose, onApply }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id || 1);

  if (luckyBlocks.length === 0) return <div>Карты закончились<button onClick={onClose}>Закрыть</button></div>;

  const card = luckyBlocks[currentCardIndex];

  const applyCard = () => {
    onApply(selectedPlayer);
    setCurrentCardIndex(prev => prev + 1);
    onClose();
  };

  return (
    <div style={{ border: "1px solid black", padding: "10px", background: "#fff" }}>
      <h3>Lucky Block</h3>
      <p><strong>{card.title}</strong></p>
      {card.effect.value && <p>Эффект: {card.effect.type} {card.effect.value}%</p>}
      <label>Игрок:</label>
      <select value={selectedPlayer} onChange={e => setSelectedPlayer(Number(e.target.value))}>
        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <br />
      <button onClick={applyCard}>Применить</button>
      <button onClick={onClose}>Закрыть</button>
    </div>
  );
};

export default LuckyBlockModal;



//newsmodal.jsx

import React, { useState } from "react";

const NewsModal = ({ players, assets, newsDeck, onClose, onApply }) => {
  if (newsDeck.length === 0) return <div>Новости закончились<button onClick={onClose}>Закрыть</button></div>;

  const [currentIndex, setCurrentIndex] = useState(0);
  const newsItem = newsDeck[currentIndex];

  const applyNews = () => {
    players.forEach(player => {
      const newAssets = { ...player.assets };
      Object.entries(player.assets).forEach(([id, qty]) => {
        const asset = assets.find(a => a.id === id);
        if (!asset) return;
        if (newsItem.targets === "ALL" || newsItem.targets.includes(id)) {
          let percent = newsItem.percent;
          if (asset.category === "CRYPTO") percent *= 1.5;
          if (["GOLD", "Gold ETF"].includes(asset.id) && percent < 0) percent /= 2;
          asset.price = +(asset.price * (1 + percent / 100)).toFixed(1);
        }
      });
    });
    setCurrentIndex(prev => prev + 1);
    onApply();
    onClose();
  };

  return (
    <div style={{ border: "1px solid black", padding: "10px", background: "#fff" }}>
      <h3>Новость</h3>
      <p><strong>{newsItem.title}</strong></p>
      <p>Эффект: {newsItem.percent > 0 ? "+" : ""}{newsItem.percent}%</p>
      <button onClick={applyNews}>Применить</button>
      <button onClick={onClose}>Закрыть</button>
    </div>
  );
};

export default NewsModal;



//roundreport.jsx

import React from "react";

const RoundReport = ({ report }) => {
  if (!report || report.length === 0) return null;
  return (
    <div style={{ border: "1px solid black", padding: "10px", background: "#eee", marginTop: "10px" }}>
      <h3>Отчёт раунда</h3>
      <ul>
        {report.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default RoundReport;
