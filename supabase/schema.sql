-- =====================================================================================
-- UNHEARD SUPABASE SCHEMA
-- =====================================================================================
-- Contains all tables, Enums, and Row Level Security (RLS) policies based on the 
-- latest Unheard Implementation Plan.
--
-- Instructions: Run this in your Supabase SQL Editor.
-- =====================================================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'blogger', 'patient');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- 2. USER ROLES 
-- Maps Supabase Auth users to custom roles.
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role user_role DEFAULT 'patient' NOT NULL,
    is_therapist BOOLEAN DEFAULT FALSE NOT NULL,
    is_blogger BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. THERAPIST PROFILES (For 'admin' roles)
CREATE TABLE public.therapist_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    bio TEXT,
    qualification TEXT,
    qualification_desc TEXT,
    consultation_hours INT DEFAULT 0,
    display_hours TEXT DEFAULT '0+',
    ratings DECIMAL(2,1) DEFAULT 5.0,
    display_rating TEXT DEFAULT '5.0',
    specialties TEXT[] DEFAULT '{}',
    note TEXT,
    next_available_at TEXT, -- Using TEXT for flexibility as seen in mockup
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. THERAPIST AVAILABILITY
-- Stores the working hours for a given therapist.
CREATE TABLE public.therapist_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. APPOINTMENTS
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status DEFAULT 'pending' NOT NULL,
    is_trial BOOLEAN DEFAULT FALSE,
    meeting_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PRE-BOOKING QUESTIONNAIRES
-- Questionnaires filled out by the patient prior to booking confirmation.
CREATE TABLE public.pre_booking_questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE UNIQUE NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb, -- dynamic questions/answers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. PATIENT HISTORY (Private to Admin & Patient)
CREATE TABLE public.patient_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notes TEXT NOT NULL,
    reference_doctor TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PRESCRIPTIONS (Private to Admin & Patient)
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    details TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. CONTACT INQUIRIES
CREATE TABLE public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. BLOGS
CREATE TABLE public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of content blocks
    published BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_booking_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 1. USER ROLES Policies
-- Users can read their own role; super_admins can read/update all.
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- 2. THERAPIST PROFILES Policies
-- Publicly readable by anyone.
CREATE POLICY "Public profiles" ON public.therapist_profiles FOR SELECT USING (true);
-- Therapists can manage their own profile.
CREATE POLICY "Therapists can insert own profile" ON public.therapist_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Therapists can update own profile" ON public.therapist_profiles FOR UPDATE USING (auth.uid() = user_id);

-- 3. THERAPIST AVAILABILITY Policies
-- Publicly readable so patients can see availability.
CREATE POLICY "Public availability" ON public.therapist_availability FOR SELECT USING (true);
-- Therapists can manage their own availability.
CREATE POLICY "Therapists manage availability" ON public.therapist_availability FOR ALL USING (auth.uid() = therapist_id);

-- 4. APPOINTMENTS Policies
-- Patients can view their own appointments; Therapists can view theirs.
CREATE POLICY "Patients view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Therapists view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = therapist_id);
-- Patients can insert appointments (request a slot).
CREATE POLICY "Patients request appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
-- Therapists can update (confirm/cancel).
CREATE POLICY "Therapists update appointments" ON public.appointments FOR UPDATE USING (auth.uid() = therapist_id);

-- 5. PRE-BOOKING QUESTIONNAIRES Policies
-- Patient can create; Patient & Therapist can view.
CREATE POLICY "Patients view/insert own questionnaire" ON public.pre_booking_questionnaires FOR ALL USING (
    EXISTS (SELECT 1 FROM public.appointments WHERE id = appointment_id AND patient_id = auth.uid())
);
CREATE POLICY "Therapists view questionnaires for their appointments" ON public.pre_booking_questionnaires FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.appointments WHERE id = appointment_id AND therapist_id = auth.uid())
);

-- 6. PATIENT HISTORY & 7. PRESCRIPTIONS
-- Therapists can manage records they author; Patients can only view records assigned to them.
CREATE POLICY "Patients view history" ON public.patient_history FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Therapists manage history" ON public.patient_history FOR ALL USING (auth.uid() = therapist_id);

CREATE POLICY "Patients view prescriptions" ON public.prescriptions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Therapists manage prescriptions" ON public.prescriptions FOR ALL USING (auth.uid() = therapist_id);

-- 8. CONTACT INQUIRIES
-- Anyone can insert; Only admins/super_admins can read (simplified: we'll check role via server, no public read).
CREATE POLICY "Anyone can insert inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);

-- 9. BLOGS
-- Publicly readable if published.
CREATE POLICY "Public can read published blogs" ON public.blogs 
    FOR SELECT USING (published = true);

-- Authors or admins can read any blog.
CREATE POLICY "Authors or admins can read all blogs" ON public.blogs 
    FOR SELECT USING (
        auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Bloggers or admins can insert blogs.
CREATE POLICY "Bloggers can insert blogs" ON public.blogs 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND (is_blogger = true OR role IN ('admin', 'super_admin')))
    );

-- Authors or admins can update/delete blogs.
CREATE POLICY "Authors or admins can update blogs" ON public.blogs 
    FOR UPDATE USING (
        auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

CREATE POLICY "Authors or admins can delete blogs" ON public.blogs 
    FOR DELETE USING (
        auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );
