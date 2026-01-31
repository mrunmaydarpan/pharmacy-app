import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://daaktar.com'; // Update with your actual API URL

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 10000,
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Auth endpoints
  async register(data: any) {
    return this.client.post('/auth/register', data);
  }

  async login(email: string, password: string) {
    return this.client.post('auth/pharmacy/login', { email, password });
  }

  async logout() {
    return this.client.post('/auth/logout');
  }

  // Pharmacy endpoints
  async getPharmacy(id: number) {
    return this.client.get(`/pharmacies/${id}`);
  }

  async updatePharmacy(id: number, data: any) {
    return this.client.put(`/pharmacies/${id}`, data);
  }

  // Doctor endpoints
  async getDoctors(location?: string) {
    const url = location ? `/doctors?location=${location}` : '/doctors';
    return this.client.get(url);
  }

  async getSpecialities() {
    return this.client.get('/specialities');
  }

  async fetchTests() {  //to fetch list of tests
    return this.client.get('/lab-tests');
  }

  // Patient endpoints
  async fetchPatients(limit: number = 100, page: number = 1) {  //to fetch list of patients
    return this.client.get(`/patient?limit=${limit}&page=${page}`);
  }

  async getPatients(pharmacyId: number, page: number = 1, limit: number = 10) {
    return this.client.get(`/patient/list?pharmacyId=${pharmacyId}&page=${page}&limit=${limit}`);
  }

  async getPatientById(id: number) {
    return this.client.get(`/patient/${id}`);
  }

  async createPatient(data: any) {
    return this.client.post('/patient', data);
  }

  async createNewPatient(data: any) {
    return this.client.post('/patient/add', data); //to create new patient inside diagnostic page
  }

  async addBooking(data: any) {
    return this.client.post('/patient/add-booking', data);
  }

  async updatePatient(id: number, data: any) {
    return this.client.put(`/patient/${id}`, data);
  }

  async deletePatient(id: number) {
    return this.client.delete(`/patient/${id}`);
  }

  // Diagnostic Test endpoints
  async getDiagnosticTests(page: number = 1, limit: number = 20) {
    return this.client.get(`/diagnostic?page=${page}&limit=${limit}`);
  }

  async getDiagnosticBookings(pharmacyId: number, page: number = 1, limit: number = 10) {
    return this.client.get(`/diagnostics/bookings?page=${page}&limit=${limit}&pharmacyId=${pharmacyId}`);
  }

  async getDiagnosticTestById(id: number) {
    return this.client.get(`/diagnostic/${id}`);
  }

  async bookDiagnosticTest(data: any) {
    return this.client.post('/diagnostic', data);
  }

  async getDiagnosticReports(page: number = 1, limit: number = 20) {
    return this.client.get(`/diagnostic/reports?page=${page}&limit=${limit}`);
  }

  async getReportById(id: number) {
    return this.client.get(`/diagnostic/reports/${id}`);
  }

  // Wallet endpoints
  async getWallet() {
    return this.client.get('/wallet');
  }

  async addWalletBalance(amount: number) {
    return this.client.post('/wallet/deposit', { amount });
  }

  async withdrawWalletBalance(amount: number) {
    return this.client.post('/wallet/withdraw', { amount });
  }

  async debitWallet(pharmacyId: number, amount: number, note: string) {
    return this.client.post('/pharmacy-wallet/debit', {
      pharmacyId,
      amount,
      note
    });
  }

  async getPharmacyWalletTransactions() {
    return this.client.get('/pharmacy-wallet/transactions');
  }

  // Ledger endpoints
  async getLedgerEntries(page: number = 1, limit: number = 20) {
    return this.client.get(`/ledger?page=${page}&limit=${limit}`);
  }

  // Sales Reports endpoints
  async getSalesReport(startDate: string, endDate: string) {
    return this.client.get(`/sales/report?start_date=${startDate}&end_date=${endDate}`);
  }

  async getDailySales(date: string) {
    return this.client.get(`/sales/daily?date=${date}`);
  }

  async getTopMedicines(limit: number = 10) {
    return this.client.get(`/sales/top-medicines?limit=${limit}`);
  }
}

export default new ApiService();
