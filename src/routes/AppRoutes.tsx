import type { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@pages/Home/Home';
import { Lobby } from '@pages/Lobby/Lobby';
import { GamePage } from '@pages/Game/GamePage';

export const AppRoutes: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
};
