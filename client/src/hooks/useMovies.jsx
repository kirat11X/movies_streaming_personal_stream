import { useContext } from 'react';
import MoviesContext from '../context/MoviesProvider';

const useMovies = () => useContext(MoviesContext);

export default useMovies;
