import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [followers, setFollowers] = useState([]); // Estado para los seguidores
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false); // Estado para el loader
  const reposPerPage = 4;
  const [currentFollowersPage, setCurrentFollowersPage] = useState(1); // Página actual para seguidores
  const followersPerPage = 6; // Número de seguidores por página

  const handleSearch = async () => {
    setLoading(true); // Mostrar loader
    setError('');
    setUserData(null);
    setRepos([]);
    setFollowers([]); // Reiniciar seguidores al buscar un nuevo usuario

    try {
      const userResponse = await axios.get(`https://api.github.com/users/${username}`, {
        headers: {
          Authorization: `token ${process.env.REACT_APP_GITHUB_TOKEN}`, // Reemplaza con tu token
        },
      });
      const reposResponse = await axios.get(userResponse.data.repos_url, {
        headers: {
          Authorization: `token ${process.env.REACT_APP_GITHUB_TOKEN}`,
        },
      });
      const followersResponse = await axios.get(userResponse.data.followers_url, {
        headers: {
          Authorization: `token ${process.env.REACT_APP_GITHUB_TOKEN}`,
        },
      }); // Obtener seguidores
      const sortedRepos = reposResponse.data.sort((a, b) => b.stargazers_count - a.stargazers_count); // Repos más votados
      setUserData(userResponse.data);
      setRepos(sortedRepos); // Guarda todos los repositorios
      setFollowers(followersResponse.data); // Guarda los seguidores
      setCurrentPage(1); // Reiniciar a la primera página cuando se busca un nuevo usuario
      setCurrentFollowersPage(1); // Reiniciar la página de seguidores
    } catch (err) {
      setError('Usuario no encontrado');
      setUserData(null);
      setRepos([]);
      setFollowers([]); // Limpiar seguidores en caso de error
    } finally {
      setLoading(false); // Ocultar loader
    }
  };

  // Manejador para la tecla Enter
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Calcular repositorios actuales a mostrar en la página
  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);

  // Calcular seguidores actuales a mostrar en la página
  const indexOfLastFollower = currentFollowersPage * followersPerPage;
  const indexOfFirstFollower = indexOfLastFollower - followersPerPage;
  const currentFollowers = followers.slice(indexOfFirstFollower, indexOfLastFollower);

  // Cambiar página
  const nextPage = () => {
    if (currentPage < Math.ceil(repos.length / reposPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextFollowersPage = () => {
    if (currentFollowersPage < Math.ceil(followers.length / followersPerPage)) {
      setCurrentFollowersPage(currentFollowersPage + 1);
    }
  };

  const prevFollowersPage = () => {
    if (currentFollowersPage > 1) {
      setCurrentFollowersPage(currentFollowersPage - 1);
    }
  };

  return (
    <div className="container">
      <Helmet>
        <title>GitHub User Search</title> {/* Cambia el título aquí */}
        <meta name="description" content="Busca usuarios de GitHub y explora sus repositorios." />
        <link rel="icon" href="%PUBLIC_URL%/logo.png" />
      </Helmet>
      <h1>GitHub User Search</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Ingresa el nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSearch}>Buscar</button>
      </div>
      {error && <p className="error">{error}</p>}
      {loading && (
        <div className="loader">
          <div className="spinner"></div>
        </div>
      )} {/* Loader */}

      {userData && (
        <div className="tabs">
          <button
            className={activeTab === 'info' ? 'active-tab' : ''}
            onClick={() => setActiveTab('info')}
          >
            Información
          </button>
          <button
            className={activeTab === 'repos' ? 'active-tab' : ''}
            onClick={() => setActiveTab('repos')}
          >
            Repositorios
          </button>
          <button
            className={activeTab === 'followers' ? 'active-tab' : ''}
            onClick={() => setActiveTab('followers')}
          >
            Seguidores
          </button>
        </div>
      )}

      {userData && activeTab === 'info' && (
        <div className="user-card">
          <img src={userData.avatar_url} alt="avatar" className="avatar" />
          <h2>{userData.name || userData.login}</h2>
          <p>Ubicación: {userData.location || 'No especificada'}</p>
          <p>Bio: {userData.bio || 'No disponible'}</p>
          <p>Repositorios públicos: {userData.public_repos}</p>
          <p>Seguidores: {userData.followers}</p>
          <p>Siguiendo: {userData.following}</p>
          <a href={userData.html_url} target="_blank" rel="noopener noreferrer">
            Ver perfil en GitHub
          </a>
        </div>
      )}

      {userData && activeTab === 'repos' && (
        <div className="repos">
          <h3>Repositorios</h3>
          <div className="repo-grid">
            {currentRepos.map((repo) => (
              <div className="repo-card" key={repo.id}>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  <h4>{repo.name}</h4>
                </a>
                <p>{repo.description || 'Sin descripción'}</p>
                <p>⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}</p>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>Anterior</button>
            <span>Página {currentPage}</span>
            <button onClick={nextPage} disabled={currentPage === Math.ceil(repos.length / reposPerPage)}>Siguiente</button>
          </div>
        </div>
      )}

      {userData && activeTab === 'followers' && (
        <div className="followers">
          <h3>Seguidores</h3>
          <div className="followers-list">
            {currentFollowers.map((follower) => (
              <div className="follower-card" key={follower.id}>
                <img src={follower.avatar_url} alt={follower.login} className="avatar" />
                <div>
                  <h4>{follower.login}</h4>
                  <a href={follower.html_url} target="_blank" rel="noopener noreferrer">Ver perfil</a>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button onClick={prevFollowersPage} disabled={currentFollowersPage === 1}>Anterior</button>
            <span>Página {currentFollowersPage}</span>
            <button onClick={nextFollowersPage} disabled={currentFollowersPage === Math.ceil(followers.length / followersPerPage)}>Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
