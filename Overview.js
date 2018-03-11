import React, { Component } from 'react';

import{
	StyleSheet,
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	Modal,
	Button,
	AsyncStorage,
} from 'react-native';

import {
	StackNavigator,
} from 'react-navigation';

import Icon from 'react-native-vector-icons/Feather';

import {
	CreateUUID
} from '../custom-functions/CustomFunctions';

export default class Overview extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			instances:[],
			inputName: '',
			inputAmount:'',
			currentId: null,
			submitButtonText: 'Add',
			modalVisible: false,
			editIndex: null,
		}
	}

	componentDidMount(){
		// Run saved data
		this.loadState('instances');
   }

	createInitialData(key){
		try{
			AsyncStorage.setItem(key, '');
		} catch(error){
			alert('Unable to save data', error.message);
		}
	}

	loadState(key, callback){
		// Load saved data to state
		AsyncStorage.getItem(key, (err, result)=>{
			if (!err) {
            if (result !== null) {
					result = JSON.parse(result);
					this.setState({[key]: result}, ()=>{
						if(typeof callback == 'function') callback();
					})
            }
         }
		});
	}

	updateInstances(instance){
		this.setState({
			instances:instance,
			inputName: '',
			inputAmount: '',
		}, ()=>{
			AsyncStorage.setItem('instances', JSON.stringify(this.state.instances));
			this.setModalVisible(false);
		});
	}

	editHandler(index){
		this.setState({
			currentId: this.state.instances[index].id,
			inputName: this.state.instances[index].name,
			inputAmount: this.state.instances[index].amount,
			submitButtonText: 'Edit',
			editIndex: index,
		}, ()=>{
			this.setModalVisible(true);
		});
	}

	editItem(){
		var instances = this.state.instances.slice();
		// Edit item
		instances[this.state.editIndex] = {
			id: this.state.currentId,
			name: this.state.inputName,
			amount: this.state.inputAmount,
		};
		this.updateInstances(instances);
	}

	addHandler(){
		this.setModalVisible(true);
		this.setState({submitButtonText:'Add', editIndex: null});
	}

	addItem(){
		// create unique id
		let newId = CreateUUID();

		// create database entry
		this.createInitialData(newId);

		var instances = this.state.instances.slice();
		var instance = {
			id: newId,
			name: this.state.inputName,
			amount: this.state.inputAmount,
		};

		// Add Item
		instances.push(instance);
		this.updateInstances(instances);
	}

	removeItem(index){
		Alert.alert(
			'Remove Item',
			'Are you sure you want to remove '+ this.state.instances[index].name +' ?',
			[
				{text: 'Cancel', onPress: () => console.log('Cancel Remove'), style: 'cancel'},
				{text: 'Yes', onPress: () => {
					try{
						// Remove in database
						let key = this.state.instances[index].id;
						AsyncStorage.removeItem(key, ()=>{
							var instances = this.state.instances.slice();
							instances.splice(index, 1); // remove item
							this.updateInstances(instances);
							//console.log('Data ['+ key +'] cleared');
						});
					} catch(error){
						alert('Unable to erase data, try again.', error.message);
					}
				}},
			],
			{ cancelable: false }
		)
	}

	openItem(index){
		this.props.navigation.navigate('Internal', {
			id: this.state.instances[index].id,
			name: this.state.instances[index].name,
			amount: this.state.instances[index].amount,
		});
	}

	setModalVisible(visible) {
		this.setState({modalVisible:visible});
	}

	render(){
		return(
			<View style={styles.main}>

				<TouchableOpacity onPress={()=>{ this.addHandler() }} style={styles.addBtnContainer}>
					<Icon name="plus" style={styles.iconAdd}/>
				</TouchableOpacity>

				<ScrollView>
					<View style={styles.listContainer}>
						{ this.state.instances.map((row, index) => {
							return(
								<View key={index} style={[styles.instanceRow, styles.verticalSpaceBetween]}>
									<View style={styles.instanceDetails}>
										<TouchableOpacity onPress={()=>{ this.openItem(index) }}>
											<Text style={{color:"#fff", fontSize:18}}>{row.name}</Text>
										</TouchableOpacity>
									</View>

									<View style={styles.instanceActions}>

										<TouchableOpacity onPress={()=>{ this.editHandler(index) }}>
											<Icon name="edit" style={styles.iconEdit}/>
										</TouchableOpacity>

										<TouchableOpacity onPress={()=>{ this.removeItem(index) }}>
											<Icon name="x-square" style={styles.iconRemove}/>
										</TouchableOpacity>

									</View>
								</View>
							)
						})}
					</View>
				</ScrollView>


				<Modal
					animationType="fade"
					transparent={false}
					presentationStyle="overFullScreen"
					visible={this.state.modalVisible}
					onRequestClose={()=>{ console.log("Closing Form") }}
					>
					<View style={styles.modalContainer}>

						<View style={styles.modalInner}>

							<TextInput
								placeholder="Enter Name"
								onChangeText={(value)=>this.setState({inputName:value})}
								value={this.state.inputName}
								style={styles.formField}
								placeholderTextColor="#fff"
								autoFocus={true}
							/>

							<TextInput
								placeholder="Enter Amount"
								onChangeText={(value)=>this.setState({
									inputAmount:value.replace(/[^0-9]/g, '')
								})}
								value={this.state.inputAmount}
								style={styles.formField}
								placeholderTextColor="#fff"
								keyboardType='numeric'
							/>
						</View>

						<View style={styles.formButtonsContainer}>
							<View style={styles.formSubmit}>
								<Button
								  title={this.state.submitButtonText}
								  color="#3bd896"
								  onPress={()=>{
									  if( this.state.submitButtonText == 'Add' ) {
											this.addItem();
										} else {
											this.editItem();
										}
								  }}
								/>
							</View>
							<View style={styles.formClose}>
								<Button
									title="Cancel"
									color="#e4530e"
									onPress={() => {
										this.setModalVisible(!this.state.modalVisible);
									}}
								/>
							</View>
						</View>

					</View>
				</Modal>

			</View>
		)
	}

}

const styles = StyleSheet.create({
	main:{
		backgroundColor: '#222',
		height: '100%',
		paddingTop: 30,
	},
	listContainer:{
		paddingBottom: 70,
	},
	addBtnContainer:{
		backgroundColor: '#1c1c1c',
		position: 'absolute',
		padding: 10,
		bottom: 10,
		right: 10,
		zIndex: 100,
	},
	iconAdd:{
		color: '#3bd896',
		fontSize: 50,
	},
	iconEdit:{
		fontSize: 30,
		color: '#3bd896',
	},
	iconRemove:{
		fontSize: 30,
		color: '#e4530e',
		marginLeft: 20,
	},
	instanceRow:{
		backgroundColor: '#272727',
		marginBottom: 20,
		padding: 10,
	},
	instanceDetails:{
		flex: 3,
	},
	verticalSpaceBetween:{
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	instanceActions:{
		flexDirection: 'row',
		marginLeft: 20
	},
	modalContainer:{
		width: '100%',
		height: '100%',
		paddingLeft: 20,
		paddingRight: 20,
		backgroundColor: '#222',
		alignItems: "center",
		justifyContent: 'center',
		flexDirection: "column",
	},
	modalInner:{
		width: '100%',
	},
	formButtonsContainer: {
		flexDirection: 'row',
		marginTop: 20,
	},
	formField:{
		color: '#fff',
		borderColor: '#fff',
		fontSize: 20,
		marginBottom: 20,
		padding: 10,
	},
	formSubmit: {
		flex:1,
		marginRight: 10,
	},
	formClose:{
		marginLeft: 10,
		flex:1,
	},
})
