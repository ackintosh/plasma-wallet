import React, { Component } from 'react';
import { connect } from 'react-redux';

import { 
  Button, 
  Header,
  Input,
  Label,
  Divider,
  Loader,
  Container,
  List,
  Table
} from 'semantic-ui-react';

import {
  web3connect,
  fetchBlockNumber,
  fetchBlock,
  updateUTXO,
  deposit,
  startExit,
  getExit,
  finalizeExit,
  transfer
} from './actions';
import Styles from './style.css';
import BigNumber from 'bignumber.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: 20000000000000000,
      account: ''
    };
  }

  async componentDidMount() {
    // initialize web3
    window.addEventListener('load', async () => {
      const wallet = await this.props.web3connect();
      await this.props.updateUTXO();
      await this.setState({account: wallet.getAddress()});
    });
  }
    
  fetchBlockNumber() {
    this.props.fetchBlockNumber();
  }

  fetchBlock() {
    this.props.fetchBlock(
      this.state.blkNum || this.props.blockNumber);
  }

  updateUTXO() {
    this.props.updateUTXO();
  }
  
  transfer() {
    const utxos = this.props.utxos;
    const amount = Number(this.state.amount);
    const amounts = utxos.map((utxo, i) => {
      return utxo.value[0].end - utxo.value[0].start;
    });
    let maxIndex = 0;
    let maxAmount = 0;
    amounts.forEach((a, i) => {
      if(maxAmount < a && a > amount) {
        maxAmount = a;
        maxIndex = i;
      }
    });
    const utxo = this.props.utxos[maxIndex];
    if(utxo) {
      this.props.transfer(
        utxo,
        this.state.toAddress,
        amount);
    }
  }

  deposit(eth) {
    this.props.deposit(eth);
  }

  startExit(utxo) {
    console.log('startExit', utxo);
    this.props.startExit(utxo);
  }

  finalizeExit(exitPos) {
    console.log('finalizeExit', exitPos);
    this.props.finalizeExit(exitPos);
  }
  
  getExit(exitPos) {
    console.log('getExit', exitPos);
    this.props.getExit(exitPos);
  }

  onBlkNumChange(e) {
    this.setState({
      blkNum: e.target.value
    });
  }

  onAddressChange(e) {
    this.setState({toAddress: e.target.value});
  }

  onAmountChange(e) {
    this.setState({amount: e.target.value});
  }

  render() {
    const { account } = this.state;

    if (!this.props.wallet) {
      return (
        <Loader active>Loading</Loader>
      );
    }
    
    return (
      <div>
        <div className={Styles['header-top']} >
          <Container>
            <Header as='h1'>Plasma Sample Wallet</Header>
          </Container>   
        </div>
        <div className={Styles['header-base']} >
          <Container className={Styles['container-base']}>   
            <Header as='h2'>Account</Header>
            
            {/* now we can't copy to clipboard. if you use copy to clipboard that you use library */}
            <Input 
              as='a' 
              color='teal' 
              action={{ 
                color: 'teal',
                labelPosition: 'right',
                icon: 'copy',
                content: 'Copy' 
              }}
              className={Styles['form-address']}
              defaultValue={account} 
            />
            <div>
              <Button onClick={this.deposit.bind(this, '1.0')}>Deposit 1 ether</Button>
              <Button onClick={this.deposit.bind(this, '2.0')}>Deposit 2 ether</Button>
              <Button onClick={this.deposit.bind(this, '10.0')}>Deposit 10 ether</Button>
            </div>

            <Header as='h2'>Balance</Header>
            {this.props.wallet.getBalance().toString()}

            <Divider />
            <div>
              <Header as='h2'>To Address: </Header>
              <Input 
                className={Styles['form-input-address']}
                onChange={this.onAddressChange.bind(this)}
              />
              <Input
                placeholder="amount"
                type="number"
                value={this.state.amount}
                className={Styles['form-input-address']}
                onChange={this.onAmountChange.bind(this)}
              />
            </div>
            <Button onClick={this.transfer.bind(this)}>transfer</Button>


            <Divider />
            <List>
              <List.Item className={Styles['content-horizontal']}>
                <List.Content>
                  <Header as='h2'>UTXO List</Header>
                </List.Content>
                <List.Content floated='right' >
                  <Button onClick={this.updateUTXO.bind(this)}>updateUTXOs</Button>
                </List.Content>
              </List.Item>
            </List>
            <Table celled fixed>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Start</Table.HeaderCell>
                  <Table.HeaderCell>End</Table.HeaderCell>
                  <Table.HeaderCell>BlkNum</Table.HeaderCell>
                  <Table.HeaderCell>Exit</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  this.props.utxos 
                    ? this.props.utxos
                      .map((utxo, i) => {
                        return (
                          <Table.Row key={i} >
                            <Table.Cell>{JSON.stringify(utxo.getOutput().getSegment(0).start)}</Table.Cell>
                            <Table.Cell>{JSON.stringify(utxo.getOutput().getSegment(0).end)}</Table.Cell>
                            <Table.Cell>{JSON.stringify(utxo.blkNum)}</Table.Cell>
                            <Table.Cell>
                              <Button onClick={this.startExit.bind(this, utxo)}>startExit</Button>
                            </Table.Cell>
                          </Table.Row>
                        );
                      }) 
                    : null
                }
              </Table.Body>
            </Table>

            <Divider />
            <p>Exit List</p>
            {
              this.props.wallet.getExits().map((exit, i) => {
                return (
                  <div key={i}>
                    {JSON.stringify(exit.utxo.value)}
                    <button onClick={this.props.finalizeExit.bind(this, exit.exitPos)}>finalizeExit</button>
                    <button onClick={this.props.getExit.bind(this, exit.exitPos)}>getExit</button>
                  </div>
                );
              })
            }

            <Divider />
            <Header as='h2'>Block Number</Header>
            <Input
              onChange={this.onBlkNumChange.bind(this)}
            />
            <Button onClick={this.fetchBlock.bind(this)}>fetchBlock</Button>

            <Divider />
            <Label as='a' color='teal'>Block Number: {this.props.blockNumber}</Label>
            <Header as='h3'>Block</Header>
            {
              this.props.block 
                ? this.props.block.txs.map(tx => { return (JSON.stringify(tx)); }) 
                : null
            }
          </Container>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  web3connect,
  fetchBlockNumber,
  fetchBlock,
  updateUTXO,
  deposit,
  startExit,
  getExit,
  finalizeExit,
  transfer
};

const mapStateToProps = (state) => ({
  wallet: state.wallet,
  blockNumber: state.blockNumber,
  block: state.block,
  utxos: state.utxos,
  txResult: state.txResult
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
