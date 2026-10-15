import {Component, type ReactNode} from 'react';
export default class BiologyBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state={failed:false};
  static getDerivedStateFromError() {return {failed:true};}
  render() {return this.state.failed ? <section role="alert" style={{padding:'3rem'}}><h1>Biology could not load</h1><p>Reload to retry, or return to English.</p><button onClick={() => location.reload()}>Reload Biology</button> <a href="#home">English home</a></section> : this.props.children;}
}
