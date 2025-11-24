import { render, screen } from '@testing-library/react';
import App from './App';

test('shows the intro greeting first', () => {
  render(<App />);
  const greeting = screen.getByText(/Hi bby/i);
  expect(greeting).toBeInTheDocument();
});
