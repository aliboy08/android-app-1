import React, { Component } from 'react';

import {
	View,
	Text,
	Button,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Modal,
	ScrollView,
	AsyncStorage,
	Alert,
} from 'react-native';

import {
	FormatDisplayNumber
} from '../custom-functions/CustomFunctions';

import {
	StackNavigator,
} from 'react-navigation';

import Icon from 'react-native-vector-icons/Feather';
import DatePicker from 'react-native-datepicker'

export default class Internal extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			id: props.navigation.state.params.id,
			name: props.navigation.state.params.name,
			totalPrice: props.navigation.state.params.amount,
			remainingBalance: 0,
			totalPaid: 0,
			payments:[],
			inputAmount: '',
			inputDate: '',
			inputDescription: '',
			modalVisible: false,
			submitButtonText: 'Add',
			editIndex: null,
		};
	}

	componentDidMount(){
		this.loadData(this.state.id, 'payments', this.calculateRemaining);
   }

	loadData(storageKey, stateKey, callback){
		// Load saved data to state
		AsyncStorage.getItem(storageKey, (err, result)=>{
			if (!err) {
            if (result !== null) {
					result = JSON.parse(result);
					this.setState({[stateKey]: result}, ()=>{
						if(typeof callback == 'function') callback();
					})
            }
         } else {
				alert('error loading data', err.message);
			}
		});
	}


	setModalVisible(visible) {
		this.setState({modalVisible:visible});
	}

	calculateRemaining = () => {
		let totalPaid = 0;
		// Calculate total paid
		this.state.payments.forEach((i)=>{
			totalPaid += parseInt(i.amount);
		});

		// Calculate total remaining
		let totalReamaining = this.state.totalPrice - parseInt(totalPaid);
		this.setState({
			remainingBalance: totalReamaining,
			totalPaid: totalPaid,
		});
	}

	AddPayment = () => {
		let payments = this.state.payments.slice();
		let payment = {
			amount: this.state.inputAmount,
			date: this.state.inputDate,
			description: this.state.inputDescription,
		};
		payments.push(payment);
		this.updatePayment(payments);
	}

	editPayment(){
		var payments = this.state.payments.slice();
		payments[this.state.editIndex] = {
			amount: this.state.inputAmount,
			date: this.state.inputDate,
			description: this.state.inputDescription,
		};
		this.updatePayment(payments);
	}

	updatePayment(payments){
		this.setState({
			payments:payments,
			inputAmount: '',
			inputDate: '',
			inputDescription: '',
		}, ()=>{
			this.calculateRemaining();
			AsyncStorage.setItem(this.state.id, JSON.stringify(payments));
			this.setModalVisible(false); // close modal
		});
	}

	editItem(index) {
		this.setState({
			inputAmount: this.state.payments[index].amount,
			inputDate: this.state.payments[index].date,
			inputDescription: this.state.payments[index].description,
			submitButtonText: 'Edit',
			editIndex: index,
		}, ()=>{
			//console.log('state updated', this.submitButtonText);
			this.setModalVisible(true);
		});
	}

	removeItem(index){
		Alert.alert(
			'Remove Item',
			'Are you sure you want to remove this item?',
			[
				{text: 'Cancel', onPress: () => console.log('Cancel Remove'), style: 'cancel'},
				{text: 'Yes', onPress: () => {
					var payments = this.state.payments.slice();
					payments.splice(index, 1); // remove item
					this.updatePayment(payments);
				}},
			],
			{ cancelable: false }
		)
	}

	render(){
		return(
			<View style={styles.main}>

				<View style={styles.header}>
					<View style={styles.headerLeft}>
						<View style={[styles.headerRow, styles.remainingAmount]}>
							<Text style={styles.headerLabel}>Remaining:</Text>
							<Text style={styles.headerValue}>{FormatDisplayNumber(this.state.remainingBalance)}</Text>
						</View>

						<View style={[styles.headerRow, styles.totalPaid]}>
							<Text style={styles.headerLabel}>Total Paid:</Text>
							<Text style={styles.headerValue}>{FormatDisplayNumber(this.state.totalPaid)}</Text>
						</View>

						<View style={[styles.headerRow, styles.totalPrice]}>
							<Text style={styles.headerLabel}>Total Price:</Text>
							<Text style={styles.headerValue}>{FormatDisplayNumber(this.state.totalPrice)}</Text>
						</View>
					</View>
				</View>

				<ScrollView>
					<View style={styles.listContainer}>
					{ this.state.payments.map( (row, index) => {
						return (
							<View key={index} style={styles.paymentRow}>

								<View style={styles.paymentDetails}>
									<Text style={[styles.paymentDetailsText, styles.paymentDate]}>{row.date}</Text>
									<Text style={[styles.paymentDetailsText, styles.paymentDescription]}>{row.description}</Text>
									<Text style={[styles.paymentDetailsText, styles.paymentAmount]}>{FormatDisplayNumber(row.amount)}</Text>
								</View>

								<View style={styles.paymentActions}>
									<TouchableOpacity onPress={()=>{this.editItem(index)}}>
										<Icon name="edit" style={styles.iconEdit}/>
									</TouchableOpacity>
									<TouchableOpacity onPress={()=>{this.removeItem(index)}}>
										<Icon name="x-square" style={styles.iconRemove}/>
									</TouchableOpacity>
								</View>

							</View>
						);
					})}
					</View>
				</ScrollView>

				<Modal
					animationType="fade"
					transparent={false}
					visible={this.state.modalVisible}
					onRequestClose={()=>{ console.log("Closing Form") }}
					>
					<View style={styles.form}>

						<View style={styles.formFieldsContainer}>

							<TextInput
								placeholder="Enter Amount"
								onChangeText={(value)=>this.setState({
									inputAmount:value.replace(/[^0-9]/g, '')
								})}
								value={this.state.inputAmount}
								placeholderTextColor="#fff"
								style={styles.formField}
								autoFocus={true}
								keyboardType='numeric'
							/>

							<View style={styles.dateFieldContainer}>
								<DatePicker
									date={this.state.inputDate}
									placeholder="Select date"
									format="MM/DD/YYYY"
									androidMode="spinner"
									confirmBtnText="Confirm"
									cancelBtnText="Cancel"
									showIcon={false}
									onDateChange={(date) => {
										this.setState({inputDate: date})
									}}
									customStyles={{
										dateInput:{
											borderWidth:0,
											justifyContent: 'center',
											alignItems: 'flex-start',
											paddingLeft: 5,
											paddingRight: 5,
										},
										dateText:{
											textAlign: 'left',
											color: '#fff',
											fontSize: 20,
										},
										placeholderText: {
											color: '#fff',
											fontSize: 20,
										},
									}}
									style={{width:'100%'}}
								/>
							</View>

							<TextInput
								placeholder="Enter Description"
								onChangeText={(value)=>this.setState({inputDescription:value})}
								value={this.state.inputDescription}
								placeholderTextColor="#fff"
								style={styles.formField}
							/>
						</View>

						<View style={styles.formButtonsContainer}>
							<View style={styles.formSubmit}>
								<Button
								  title={this.state.submitButtonText}
								  color="#3bd896"
								  onPress={()=>{
									  if( this.state.submitButtonText == 'Add' ) {
											this.AddPayment();
										} else {
											this.editPayment();
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

				<TouchableOpacity
					style={styles.addBtnContainer}
					onPress={() => {
					this.setModalVisible(true);
					this.setState({submitButtonText:'Add', editIndex: null});
					}}>
					<Icon name="plus" style={styles.iconAdd} />
				</TouchableOpacity>

			</View>
		);
	}
}

const styles = StyleSheet.create({
	main:{
		height: "100%",
		backgroundColor: '#272727',
	},
	header: {
		backgroundColor: '#1c1c1c',
		padding: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: 'center',
	},
	headerRow: {
		marginBottom: 5,
		flexDirection: "row",
		alignItems: "center",
	},
	headerLabel: {
		color: '#fff',
		width: 70,
		fontSize: 12,
	},
	headerValue: {
		color: '#fff',
		fontSize: 18,
		fontWeight: "700"
	},
	listContainer:{
		paddingBottom: 70,
	},
	totalPrice:{
		opacity: .5,
	},
	rowAmount: {
		color: '#fff',
		fontWeight: "700",
	},
	addBtnContainer:{
		backgroundColor: '#1c1c1c',
		position: 'absolute',
		padding: 10,
		bottom: 10,
		right: 10,
		zIndex: 100,
	},
	paymentRow: {
		padding: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	paymentDetails:{
		flex: 3,
	},
	paymentDetailsText:{
		color: '#999',
		fontSize: 12,
		lineHeight: 22,
		fontWeight: '300',
	},
	paymentAmount:{
		color: '#ddd',
		fontSize: 14,
	},
	paymentActions: {
		flexDirection: "row",
		flex:1,
		marginLeft: 20,
	},
	iconEdit: {
		fontSize: 30,
		color: '#3bd896',
		opacity: .8,
	},
	iconRemove: {
		fontSize: 30,
		color: '#e4530e',
		opacity: .8,
		marginLeft: 20,
	},
	iconAdd: {
		color: '#3bd896',
		fontSize: 50,
	},
	form: {
		width: '100%',
		height: '100%',
		paddingLeft: 20,
		paddingRight: 20,
		backgroundColor: '#222',
		alignItems: "center",
		justifyContent: 'center',
		flexDirection: "column",
	},
	formFieldsContainer:{
		width: '100%',
	},
	formField:{
		color: '#fff',
		borderColor: '#fff',
		fontSize: 20,
		marginBottom: 20,
		padding: 10,
	},
	dateFieldContainer:{
		width:'100%',
		marginLeft:4,
		borderBottomWidth: 1.5,
		borderColor: '#181818',
		marginBottom: 20,
	},
	formButtonsContainer: {
		flexDirection: 'row',
		marginTop: 20,
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
