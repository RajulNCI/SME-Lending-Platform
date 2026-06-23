-- FinPal RDS schema — run once in the RDS Query Editor (or psql)
-- Requires: database "creditcore" already exists

-- Enum types
CREATE TYPE userrole AS ENUM ('borrower_sme', 'credit_officer', 'underwriter', 'compliance_officer', 'admin');
CREATE TYPE applicationstatus AS ENUM ('draft', 'submitted', 'documents_uploaded', 'idp_processing', 'ccr_check', 'ai_assessment', 'hitl_queue', 'approved', 'declined', 'referred', 'withdrawn');
CREATE TYPE decisionoutcome AS ENUM ('approved', 'declined', 'referred');
CREATE TYPE jobstatus AS ENUM ('pending', 'running', 'completed', 'failed');

-- Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    hashed_pw VARCHAR(255) NOT NULL,
    role userrole NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_login TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) NOT NULL,
    reference VARCHAR(20) NOT NULL,
    -- Borrower / company
    company_name VARCHAR(255) NOT NULL,
    crn VARCHAR(20) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    director_name VARCHAR(200) NOT NULL,
    director_email VARCHAR(255) NOT NULL,
    director_phone VARCHAR(50) NOT NULL,
    address VARCHAR(500) NOT NULL,
    eircode VARCHAR(10),
    years_trading VARCHAR(20) NOT NULL,
    -- Loan
    loan_amount NUMERIC(12, 2) NOT NULL,
    loan_purpose VARCHAR(100) NOT NULL,
    loan_term_months INTEGER NOT NULL,
    purpose_detail TEXT NOT NULL,
    has_collateral BOOLEAN NOT NULL DEFAULT FALSE,
    collateral_detail TEXT,
    -- Financials (declared — from credit file)
    annual_revenue NUMERIC(14, 2),
    ebitda NUMERIC(14, 2),
    net_profit NUMERIC(14, 2),
    total_assets NUMERIC(14, 2),
    total_liabilities NUMERIC(14, 2),
    existing_debt NUMERIC(14, 2),
    free_cash_flow NUMERIC(14, 2),
    monthly_repayment NUMERIC(12, 2),
    annual_debt_service NUMERIC(12, 2),
    -- Open banking (bank statement)
    iban VARCHAR(40),
    account_mask VARCHAR(20),
    statement_period VARCHAR(50),
    actual_revenue NUMERIC(14, 2),
    monthly_lodgements JSON,
    -- Tax clearance (compliance)
    tax_reg_no VARCHAR(30),
    tax_access_no VARCHAR(30),
    tax_clearance_status VARCHAR(20),
    tax_clearance_issued DATE,
    tax_clearance_valid_until DATE,
    -- Director ID / KYC (AML)
    director_dob DATE,
    director_id_number VARCHAR(50),
    director_nationality VARCHAR(100),
    id_verified BOOLEAN NOT NULL DEFAULT FALSE,
    -- AI assessment output (populated after processing)
    ai_score NUMERIC(5, 2),
    risk_grade VARCHAR(5),
    pd NUMERIC(6, 4),
    dscr NUMERIC(6, 3),
    apr NUMERIC(6, 3),
    affordability NUMERIC(5, 2),
    lgd NUMERIC(5, 4),
    ead NUMERIC(14, 2),
    ecl_12m NUMERIC(12, 2),
    ecl_lifetime NUMERIC(12, 2),
    ifrs9_stage INTEGER,
    shap_codes JSON,
    rules_output JSON,
    narrative TEXT,
    recommendation VARCHAR(20),
    -- GDPR consents (4 consents from consent form)
    consent_data_processing BOOLEAN NOT NULL DEFAULT FALSE,
    consent_ccr BOOLEAN NOT NULL DEFAULT FALSE,
    consent_ai_decision BOOLEAN NOT NULL DEFAULT FALSE,
    consent_data_retention BOOLEAN NOT NULL DEFAULT FALSE,
    consent_timestamp TIMESTAMP WITH TIME ZONE,
    -- Status and metadata
    status applicationstatus NOT NULL DEFAULT 'draft',
    borrower_id VARCHAR(36) REFERENCES users(id),
    model_version VARCHAR(50) NOT NULL DEFAULT 'finpal-pd-v2.4.1',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (reference)
);
CREATE INDEX IF NOT EXISTS ix_applications_reference ON applications (reference);

-- Audit logs (immutable chain — append only)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    application_id VARCHAR(36) REFERENCES applications(id),
    actor_id VARCHAR(36) REFERENCES users(id),
    actor_username VARCHAR(100),
    description TEXT NOT NULL,
    payload JSON,
    ip_address VARCHAR(45),
    correlation_id VARCHAR(36),
    prev_hash VARCHAR(64),
    entry_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Decisions (credit officer decisions)
CREATE TABLE IF NOT EXISTS decisions (
    id VARCHAR(36) NOT NULL,
    application_id VARCHAR(36) NOT NULL REFERENCES applications(id),
    officer_id VARCHAR(36) NOT NULL REFERENCES users(id),
    outcome decisionoutcome NOT NULL,
    rationale TEXT NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    ai_score FLOAT,
    risk_grade VARCHAR(5),
    shap_snapshot JSON,
    decided_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    integrity_hash VARCHAR(64),
    PRIMARY KEY (id)
);

-- Documents (uploaded files, stored in S3)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) NOT NULL,
    application_id VARCHAR(36) NOT NULL REFERENCES applications(id),
    doc_type VARCHAR(50) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes INTEGER NOT NULL,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    extracted_data VARCHAR(36),
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Processing jobs (AI pipeline tracking)
CREATE TABLE IF NOT EXISTS processing_jobs (
    id VARCHAR(36) NOT NULL,
    application_id VARCHAR(36) NOT NULL REFERENCES applications(id),
    status jobstatus NOT NULL DEFAULT 'pending',
    current_step VARCHAR(40),
    progress INTEGER NOT NULL DEFAULT 0,
    steps_log JSON,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);
