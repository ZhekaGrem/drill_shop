import { Component, type ReactNode } from 'react';
import styles from './HeroVisual.module.scss';

type Props = { children: ReactNode; resetKey: object };

export class SceneErrorBoundary extends Component<Props, { failed: boolean; resetKey: object }> {
  state = { failed: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  static getDerivedStateFromProps(props: Props, state: { resetKey: object }) {
    return props.resetKey !== state.resetKey ? { failed: false, resetKey: props.resetKey } : null;
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className={styles.loadError} role="alert">
        <p>Не вдалося завантажити 3D-модель.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Спробувати ще раз
        </button>
      </div>
    );
  }
}
