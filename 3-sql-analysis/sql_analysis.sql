-- SQL Queries: Analyzing a Database Online
-- Online Store Sales Data Analysis

-- ============================================
-- 1. CREATE TABLE AND INSERT DATA
-- ============================================

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer TEXT,
    amount REAL,
    order_date DATE
);

INSERT INTO orders (customer, amount, order_date) VALUES
('Alice', 5000, '2024-03-01'),
('Bob', 8000, '2024-03-05'),
('Alice', 3000, '2024-03-15'),
('Charlie', 7000, '2024-02-20'),
('Alice', 10000, '2024-02-28'),
('Bob', 4000, '2024-02-10'),
('Charlie', 9000, '2024-03-22'),
('Alice', 2000, '2024-03-30');

-- ============================================
-- 2. ANALYSIS QUERIES
-- ============================================

-- Task 1: Calculate the total sales volume for March 2024
-- Expected Result: 27,000
SELECT 
    'March 2024 Total Sales' AS description,
    SUM(amount) AS total_sales,
    COUNT(*) AS order_count
FROM orders 
WHERE order_date >= '2024-03-01' 
  AND order_date <= '2024-03-31';

-- Task 2: Find the customer who spent the most overall
-- Expected Result: Alice (20,000)
SELECT 
    'Top Spending Customer' AS description,
    customer,
    SUM(amount) AS total_spent,
    COUNT(*) AS order_count
FROM orders 
GROUP BY customer 
ORDER BY total_spent DESC 
LIMIT 1;

-- Task 3: Calculate the average order value for the last three months
-- Expected Result: 6,000 (total sales / number of orders)
SELECT 
    'Average Order Value (All Time)' AS description,
    ROUND(AVG(amount), 2) AS average_order_value,
    SUM(amount) AS total_sales,
    COUNT(*) AS total_orders
FROM orders;

-- ============================================
-- 3. ADDITIONAL ANALYSIS QUERIES
-- ============================================

-- Show all customers with their total spending
SELECT 
    customer,
    SUM(amount) AS total_spent,
    COUNT(*) AS order_count,
    ROUND(AVG(amount), 2) AS avg_order_value,
    MIN(order_date) AS first_order,
    MAX(order_date) AS last_order
FROM orders 
GROUP BY customer 
ORDER BY total_spent DESC;

-- Monthly sales breakdown
SELECT 
    strftime('%Y-%m', order_date) AS month,
    SUM(amount) AS monthly_sales,
    COUNT(*) AS order_count,
    ROUND(AVG(amount), 2) AS avg_order_value
FROM orders 
GROUP BY strftime('%Y-%m', order_date)
ORDER BY month;

-- Top 3 largest individual orders
SELECT 
    'Top 3 Largest Orders' AS description,
    customer,
    amount,
    order_date
FROM orders 
ORDER BY amount DESC 
LIMIT 3;

-- Customer activity by month
SELECT 
    customer,
    strftime('%Y-%m', order_date) AS month,
    SUM(amount) AS monthly_spending,
    COUNT(*) AS monthly_orders
FROM orders 
GROUP BY customer, strftime('%Y-%m', order_date)
ORDER BY customer, month;

-- ============================================
-- 4. VERIFICATION QUERIES
-- ============================================

-- Verify March 2024 calculation manually
SELECT 
    'March 2024 Orders Detail' AS description,
    customer,
    amount,
    order_date
FROM orders 
WHERE order_date >= '2024-03-01' 
  AND order_date <= '2024-03-31'
ORDER BY order_date;

-- Verify Alice's total spending manually
SELECT 
    'Alice Orders Detail' AS description,
    amount,
    order_date
FROM orders 
WHERE customer = 'Alice'
ORDER BY order_date;

-- Show all data for verification
SELECT 
    'All Orders' AS description,
    id,
    customer,
    amount,
    order_date
FROM orders 
ORDER BY order_date, customer;
