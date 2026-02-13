import Dashboard from './routes/Dashboard.svelte';
import LocalNetworks from './routes/LocalNetworks.svelte';
import Moons from './routes/Moons.svelte';
import NetworkPeers from './routes/Local/NetworkPeers.svelte';
import NetworkSettings from './routes/Local/NetworkSettings.svelte';
import CentralNetworkList from './routes/Central/NetworkList.svelte';
import NetworkMembers from './routes/Central/NetworkMembers.svelte';
import CentralNetworkSettings from './routes/Central/NetworkSettings.svelte';
import Settings from './routes/Settings.svelte';

export const routes = {
  '/': Dashboard,
  '/local': LocalNetworks,
  '/moons': Moons,
  '/local/peers/:id': NetworkPeers,
  '/local/settings/:id': NetworkSettings,
  '/central': CentralNetworkList,
  '/central/:id': NetworkMembers,
  '/central/:id/settings': CentralNetworkSettings,
  '/settings': Settings,
};
