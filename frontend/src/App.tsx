import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { RepartoProporcional } from './pages/RepartoProporcional';
import { InteresSimple } from './pages/InteresSimple';
import { DescuentoSimple } from './pages/DescuentoSimple';
import { InteresCompuesto } from './pages/InteresCompuesto';
import { TasaNominalPeriodica } from './pages/TasaNominalPeriodica';
import { TasaEfectiva } from './pages/TasaEfectiva';
import { EquivalenciaTasas } from './pages/EquivalenciaTasas';
import { TasaAnticipadaVencida } from './pages/TasaAnticipadaVencida';
import { Capitalizacion } from './pages/Capitalizacion';
import { AnualidadesVencidas } from './pages/AnualidadesVencidas';
import { AnualidadesAnticipadas } from './pages/AnualidadesAnticipadas';
import { AnualidadesDiferidas } from './pages/AnualidadesDiferidas';
import { Perpetuidades } from './pages/Perpetuidades';
import { Amortizacion } from './pages/Amortizacion';
import { AbonosExtraTiempo } from './pages/AbonosExtraTiempo';
import { AbonosExtraCuota } from './pages/AbonosExtraCuota';
import { EcuacionesValor } from './pages/EcuacionesValor';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/reparto-proporcional" element={<RepartoProporcional />} />
        <Route path="/interes-simple" element={<InteresSimple />} />
        <Route path="/descuento-simple" element={<DescuentoSimple />} />
        <Route path="/interes-compuesto" element={<InteresCompuesto />} />
        <Route path="/tasa-nominal-periodica" element={<TasaNominalPeriodica />} />
        <Route path="/tasa-efectiva" element={<TasaEfectiva />} />
        <Route path="/equivalencia-tasas" element={<EquivalenciaTasas />} />
        <Route path="/tasa-anticipada-vencida" element={<TasaAnticipadaVencida />} />
        <Route path="/capitalizacion" element={<Capitalizacion />} />
        <Route path="/anualidades-vencidas" element={<AnualidadesVencidas />} />
        <Route path="/anualidades-anticipadas" element={<AnualidadesAnticipadas />} />
        <Route path="/anualidades-diferidas" element={<AnualidadesDiferidas />} />
        <Route path="/perpetuidades" element={<Perpetuidades />} />
        <Route path="/amortizacion" element={<Amortizacion />} />
        <Route path="/abonos-extra-tiempo" element={<AbonosExtraTiempo />} />
        <Route path="/abonos-extra-cuota" element={<AbonosExtraCuota />} />
        <Route path="/ecuaciones-valor" element={<EcuacionesValor />} />
      </Route>
    </Routes>
  );
}
