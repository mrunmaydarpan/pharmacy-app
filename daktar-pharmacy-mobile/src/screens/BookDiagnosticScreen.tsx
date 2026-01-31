import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DropDown from '../../components/DropDown';
import apiService from '../services/apiService';
import { useSelector } from 'react-redux';


interface Patient {
  id: string;
  name: string;
  mobile: string;
}

interface Test {
  id: number;
  test_name: string;
  b2b_price: string;
}

interface NewPatient {
  name: string;
  mobile: string;
  note: string;
}

export default function BookDiagnosticScreen({ navigation }: any) {
  const [isAddingNewPatient, setIsAddingNewPatient] = useState(false);
  const pharmacyId = useSelector((state: any) => state.auth.user?.id);
  const [patient, setPatient] = useState<Patient[]>([]);
  const [tests, setTests] = useState<Test[]>([]);

  const loadPatients = async () => {
    try {
      const response = await apiService.fetchPatients();
      console.log(response.data.patients);
      setPatient(response.data.patients);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadTests = async () => {
    try {
      const response = await apiService.fetchTests();
      console.log(response.data);
      setTests(response.data);
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  useEffect(() => {
    console.log("add diagnostic booking...");
    loadPatients();
    loadTests();
  }, []);


  // UI State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedTestIds, setSelectedTestIds] = useState<number[]>([]);
  const [note, setNote] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientDetails, setNewPatientDetails] = useState<NewPatient>({
    name: '',
    mobile: '',
    note: ''
  });
  const [isPhoneValid, setIsPhoneValid] = useState<boolean | null>(null);

  // Total amount
  const totalAmount = selectedTestIds.reduce((sum, testId) => {
    const test = tests.find(t => t.id === testId);
    return sum + (test ? parseFloat(test.b2b_price) : 0);
  }, 0);

  const patientOptions = patient.map(p => ({
    label: `${p.name} (${p.mobile})`,
    value: p.id,
  }));

  const testOptions = tests.map(t => ({
    label: `${t.test_name} - ₹${t.b2b_price}`,
    value: t.id
  }));

  const handleTestSelect = (testId: any) => {
    if (Array.isArray(testId)) {
      setSelectedTestIds(testId);
    } else {
      if (selectedTestIds.includes(testId)) {
        setSelectedTestIds(selectedTestIds.filter(id => id !== testId));
      } else {
        setSelectedTestIds([...selectedTestIds, testId]);
      }
    }
  };

  const handleCreatePatient = () => {
    setNewPatientDetails({
      name: newPatientName,
      mobile: newPatientPhone,
      note: note,
    });
    if (isPhoneValid) {
      console.log({
        name: newPatientName,
        mobile: newPatientPhone,
        note: note,
      });
      apiService.createNewPatient({
        name: newPatientName,
        mobile: newPatientPhone,
        note: note,
      }).then((response) => {
        console.log(response);
        alert("Patient created successfully");
        loadPatients();
        setIsAddingNewPatient(false); //set to false when status code is 201
      }).catch((error) => {
        console.error('Error creating patient:', error);
        // switch (error.response.status) {
        //   case 409:
        //     alert(error.response.data.message);
        //     break;
        //   case 400:
        //     alert(error.response.data.message);
        //     break;
        //   default:
        //     alert('Something went wrong');
        //     break;
        // }
        alert(error.response.data.message);
      });
    } else {
      alert('Please enter a valid phone number');
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* <View style={styles.card}> */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Diagnostic Booking</Text>
          {/* <TouchableOpacity onPress={() => navigation?.goBack()}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity> */}
        </View>

        <View style={styles.fieldLabelContainer}>
          <Text style={styles.label}>Patient</Text>
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => {
              setIsAddingNewPatient(!isAddingNewPatient);
              setNewPatientName('');
              setNewPatientPhone('');
              setNote('');
              setIsPhoneValid(null);
            }}
          >
            <Text style={styles.addNewText}>
              {isAddingNewPatient ? 'Select Existing' : 'Add New Patient'}
            </Text>
          </TouchableOpacity>
        </View>

        {isAddingNewPatient ? (
          <View style={styles.newPatientForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Patient Name *</Text>
              <TextInput
                style={styles.inlineInput}
                placeholder="Enter patient name"
                value={newPatientName}
                onChangeText={setNewPatientName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={[
                  styles.inlineInput,
                  isPhoneValid === true && { borderColor: '#10b981' }, // emerald green
                  isPhoneValid === false && { borderColor: '#ef4444' }  // red
                ]}
                placeholder="Enter phone number (10 digits)"
                value={newPatientPhone}
                onChangeText={(text) => {
                  setNewPatientPhone(text);
                  if (text.length === 0) setIsPhoneValid(null);
                  if (text.length === 10 && /^[6-9]/.test(text)) setIsPhoneValid(true);
                  if (text.length < 10) setIsPhoneValid(false);
                }}
                keyboardType="phone-pad"
                maxLength={10}
                onBlur={() => {
                  if (newPatientPhone.length === 10) {
                    setIsPhoneValid(true);
                  } else if (newPatientPhone.length > 0) {
                    setIsPhoneValid(false);
                  } else {
                    setIsPhoneValid(null);
                  }
                }}
                textAlign="left"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.inlineInput}
                value={note}
                onChangeText={setNote}
                placeholder="Any additional notes"
              />
            </View>
            <TouchableOpacity
              style={styles.createPatientButton}
              onPress={() => { handleCreatePatient() }}
            >
              <Text style={styles.buttonText}>Create Patient</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <DropDown
            placeholder="-- Select Patient --"
            options={patientOptions}
            selectedValue={selectedPatientId}
            onSelect={setSelectedPatientId}
          />
        )}

        <Text style={styles.label}>Select Tests</Text>
        <DropDown
          placeholder="-- Select Tests --"
          options={testOptions}
          selectedValue={selectedTestIds}
          onSelect={handleTestSelect}
          multiSelect={true}
        />

        {/* Display selected tests */}
        {/* <View style={styles.selectedTestsContainer}>
          {selectedTestIds.map(testId => {
            const test = tests.find(t => t.id === testId);
            return (
              <View key={testId} style={styles.testTag}>
                <Text style={styles.testTagText}>{test?.test_name}</Text>
                <TouchableOpacity onPress={() => handleTestSelect(testId)}>
                  <Text style={styles.removeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View> */}

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Any instructions or notes"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>₹{totalAmount}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation?.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.walletButton}>
            <Text style={styles.buttonText}>Pay from Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.razorpayButton}>
            <Text style={styles.buttonText}>Pay with Razorpay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#eff6ff',
  },
  scrollContent: {
    padding: 10,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  // card: {
  //   // backgroundColor: '#fff',
  //   // borderRadius: 20,
  //   padding: 24,
  //   // shadowColor: '#000',
  //   // shadowOffset: { width: 0, height: 10 },
  //   // shadowOpacity: 0.1,
  //   // shadowRadius: 20,
  //   // elevation: 5,
  // },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeIcon: {
    fontSize: 20,
    color: '#94a3b8',
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
  },
  addNewButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addNewText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  newPatientForm: {
    backgroundColor: '#fefefe',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 6,
  },
  inlineInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#334155',
  },
  createPatientButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  noteInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#334155',
    marginBottom: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  walletButton: {
    backgroundColor: '#10b981', // Green
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  razorpayButton: {
    backgroundColor: '#6366f1', // Indigo
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 16,
  },
  selectedTestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  testTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  testTagText: {
    fontSize: 12,
    color: '#475569',
    marginRight: 6,
  },
  removeIcon: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
