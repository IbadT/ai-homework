#!/usr/bin/env node

/**
 * API Testing: Identifying Defects in Product Data
 * Tests for https://fakestoreapi.com/products API
 */

const axios = require('axios');
const fs = require('fs');
const colors = require('colors');

class APITester {
    constructor(baseUrl = 'https://fakestoreapi.com/products') {
        this.baseUrl = baseUrl;
        this.defects = [];
        this.products = [];
    }

    /**
     * Fetch products from API and validate response code
     */
    async fetchProducts() {
        try {
            console.log(`🔍 Fetching data from: ${this.baseUrl}`.cyan);
            
            const response = await axios.get(this.baseUrl, { timeout: 10000 });
            
            // Test 1: Verify server response code (expected 200)
            if (response.status === 200) {
                console.log('✅ Response code validation: PASSED (200)'.green);
                this.products = response.data;
                console.log(`📦 Retrieved ${this.products.length} products`.blue);
                return true;
            } else {
                console.log(`❌ Response code validation: FAILED (${response.status})`.red);
                this.defects.push({
                    type: 'Response Code',
                    description: `Expected 200, got ${response.status}`,
                    severity: 'CRITICAL'
                });
                return false;
            }
            
        } catch (error) {
            if (error.response) {
                console.log(`❌ HTTP Error: ${error.response.status} - ${error.response.statusText}`.red);
                this.defects.push({
                    type: 'HTTP Error',
                    description: `${error.response.status} - ${error.response.statusText}`,
                    severity: 'CRITICAL'
                });
            } else if (error.request) {
                console.log('❌ Network error: No response received'.red);
                this.defects.push({
                    type: 'Network Error',
                    description: 'No response received from server',
                    severity: 'CRITICAL'
                });
            } else {
                console.log(`❌ Error: ${error.message}`.red);
                this.defects.push({
                    type: 'Request Error',
                    description: error.message,
                    severity: 'CRITICAL'
                });
            }
            return false;
        }
    }

    /**
     * Validate each product's data structure and content
     */
    validateProductData() {
        console.log('\n🔍 Validating product data...'.cyan);
        
        this.products.forEach((product, index) => {
            const productId = product.id || `Product_${index}`;
            const productDefects = [];
            
            // Test 2: Verify title attribute exists and is not empty
            if (!product.hasOwnProperty('title')) {
                productDefects.push({
                    field: 'title',
                    issue: 'Missing title field',
                    expected: 'Non-empty string',
                    actual: 'Field not present'
                });
            } else if (!product.title || !String(product.title).trim()) {
                productDefects.push({
                    field: 'title',
                    issue: 'Empty or whitespace-only title',
                    expected: 'Non-empty string',
                    actual: `"${product.title}"`
                });
            }
            
            // Test 3: Verify price attribute exists and is not negative
            if (!product.hasOwnProperty('price')) {
                productDefects.push({
                    field: 'price',
                    issue: 'Missing price field',
                    expected: 'Non-negative number',
                    actual: 'Field not present'
                });
            } else {
                const price = parseFloat(product.price);
                if (isNaN(price)) {
                    productDefects.push({
                        field: 'price',
                        issue: 'Invalid price format',
                        expected: 'Valid number',
                        actual: `"${product.price}"`
                    });
                } else if (price < 0) {
                    productDefects.push({
                        field: 'price',
                        issue: 'Negative price',
                        expected: 'Non-negative number',
                        actual: price
                    });
                }
            }
            
            // Test 4: Verify rating.rate exists and does not exceed 5
            if (!product.hasOwnProperty('rating')) {
                productDefects.push({
                    field: 'rating',
                    issue: 'Missing rating field',
                    expected: 'Object with rate property',
                    actual: 'Field not present'
                });
            } else if (typeof product.rating !== 'object' || product.rating === null) {
                productDefects.push({
                    field: 'rating',
                    issue: 'Rating is not an object',
                    expected: 'Object with rate property',
                    actual: typeof product.rating
                });
            } else if (!product.rating.hasOwnProperty('rate')) {
                productDefects.push({
                    field: 'rating.rate',
                    issue: 'Missing rate field in rating',
                    expected: 'Number between 0 and 5',
                    actual: 'Field not present'
                });
            } else {
                const rate = parseFloat(product.rating.rate);
                if (isNaN(rate)) {
                    productDefects.push({
                        field: 'rating.rate',
                        issue: 'Invalid rating format',
                        expected: 'Valid number',
                        actual: `"${product.rating.rate}"`
                    });
                } else if (rate > 5) {
                    productDefects.push({
                        field: 'rating.rate',
                        issue: 'Rating exceeds maximum value',
                        expected: 'Number between 0 and 5',
                        actual: rate
                    });
                } else if (rate < 0) {
                    productDefects.push({
                        field: 'rating.rate',
                        issue: 'Negative rating',
                        expected: 'Number between 0 and 5',
                        actual: rate
                    });
                }
            }
            
            // Add product to defects list if it has issues
            if (productDefects.length > 0) {
                this.defects.push({
                    product_id: productId,
                    product_title: product.title || 'Unknown',
                    defects: productDefects
                });
            }
        });
        
        console.log(`✅ Data validation completed. Found ${this.defects.length} products with defects.`.blue);
    }

    /**
     * Generate detailed defect report
     */
    generateReport() {
        console.log('\n' + '='.repeat(80).yellow);
        console.log('📊 API TESTING REPORT'.bold.yellow);
        console.log('='.repeat(80).yellow);
        console.log(`🕐 Test Date: ${new Date().toLocaleString()}`.cyan);
        console.log(`🌐 API Endpoint: ${this.baseUrl}`.cyan);
        console.log(`📦 Total Products: ${this.products.length}`.blue);
        console.log(`❌ Products with Defects: ${this.defects.length}`.red);
        console.log(`✅ Products without Defects: ${this.products.length - this.defects.length}`.green);
        
        if (this.defects.length > 0) {
            console.log('\n🚨 DEFECTS FOUND:'.red.bold);
            console.log('-'.repeat(80).red);
            
            this.defects.forEach((defect, index) => {
                if (defect.product_id) {
                    console.log(`\n${index + 1}. Product ID: ${defect.product_id}`.yellow);
                    console.log(`   Title: ${defect.product_title}`.white);
                    console.log('   Issues:'.red);
                    defect.defects.forEach(issue => {
                        console.log(`     • ${issue.field}: ${issue.issue}`.red);
                        console.log(`       Expected: ${issue.expected}`.green);
                        console.log(`       Actual: ${issue.actual}`.red);
                    });
                } else {
                    console.log(`\n${index + 1}. ${defect.type}: ${defect.description}`.red);
                    console.log(`   Severity: ${defect.severity}`.red.bold);
                }
            });
        } else {
            console.log('\n✅ NO DEFECTS FOUND - All products passed validation!'.green.bold);
        }
        
        console.log('\n' + '='.repeat(80).yellow);
    }

    /**
     * Save detailed report to JSON file
     */
    saveReportToFile(filename = 'api_test_report.json') {
        const report = {
            test_info: {
                date: new Date().toISOString(),
                api_endpoint: this.baseUrl,
                total_products: this.products.length,
                products_with_defects: this.defects.length
            },
            defects: this.defects,
            all_products: this.products
        };
        
        try {
            fs.writeFileSync(filename, JSON.stringify(report, null, 2), 'utf8');
            console.log(`💾 Detailed report saved to: ${filename}`.green);
        } catch (error) {
            console.log(`❌ Error saving report: ${error.message}`.red);
        }
    }

    /**
     * Run all tests and return success status
     */
    async runTests() {
        console.log('🚀 Starting API Tests for FakeStore API'.bold.cyan);
        console.log('='.repeat(50).cyan);
        
        // Fetch products
        const fetchSuccess = await this.fetchProducts();
        if (!fetchSuccess) {
            return false;
        }
        
        // Validate product data
        this.validateProductData();
        
        // Generate report
        this.generateReport();
        
        // Save detailed report
        this.saveReportToFile();
        
        // Return true if no critical defects found
        const criticalDefects = this.defects.filter(d => d.severity === 'CRITICAL');
        return criticalDefects.length === 0;
    }
}

/**
 * Main function to run the API tests
 */
async function main() {
    const tester = new APITester();
    
    try {
        const success = await tester.runTests();
        
        if (success) {
            console.log('\n🎉 All tests completed successfully!'.green.bold);
            process.exit(0);
        } else {
            console.log('\n💥 Tests completed with critical issues found!'.red.bold);
            process.exit(1);
        }
    } catch (error) {
        console.log(`\n💥 Unexpected error: ${error.message}`.red.bold);
        process.exit(1);
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = APITester;
