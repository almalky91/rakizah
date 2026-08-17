-- Insert all 140 skills from ETEC curriculum
-- Grade 3: 13 Math skills
-- Grade 6: 21 Math skills + 33 Science skills  
-- Grade 9: 25 Math skills + 48 Science skills

-- Grade 3 Math Skills (13 skills)
-- Field: الأعداد والعمليات (Numbers and Operations)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('f5dda44e-4b5a-9ef3-aabe-baa4ae835f66', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'فهم القيمة المنزلية للأعداد ضمن أربع منازل — قراءة، كتابة، مقارنة، ترتيب، تقريب', 'basic', 1),
('f5dda44e-4b5a-9ef3-aabe-baa4ae835f66', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, 'فهم الكسور — تمثيل، قراءة، كتابة، مقارنة، ترتيب، وإيجاد المتكافئة', 'basic', 2),
('f5dda44e-4b5a-9ef3-aabe-baa4ae835f66', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, 'إيجاد نواتج جمع وطرح الأعداد ضمن ثلاث منازل وتقديرها وحل مسائل حياتية', 'basic', 3),
('f5dda44e-4b5a-9ef3-aabe-baa4ae835f66', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4, 'فهم عمليتي الضرب والقسمة — تكوين الحقائق المترابطة وإيجاد النواتج وحل مسائل', 'basic', 4)
ON CONFLICT DO NOTHING;

-- Field: الجبر والتحليل (Algebra and Analysis)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('a6eeb33f-3c6b-0ef4-bbcf-cbb5bf946a77', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, 'وصف الأنماط غير العددية والعددية والهندسية المتنامية — إكمالها وتوسيعها', 'basic', 5),
('a6eeb33f-3c6b-0ef4-bbcf-cbb5bf946a77', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 6, 'تمييز خصائص العمليات الأربع — الإبدال، التجميع، التوزيع، الصفر، الواحد', 'basic', 6),
('a6eeb33f-3c6b-0ef4-bbcf-cbb5bf946a77', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 7, 'تمييز العلاقات بين العمليات الأربع واستخدامها لإيجاد النواتج والتحقق منها', 'basic', 7)
ON CONFLICT DO NOTHING;

-- Field: الهندسة والقياس (Geometry and Measurement)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('b7ffc22a-2d7c-1ef5-ccda-dcc6ca057b88', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 8, 'فهم خصائص الأشكال الهندسية ثنائية وثلاثية الأبعاد — تصنيفها والمقارنة بينها', 'basic', 8),
('b7ffc22a-2d7c-1ef5-ccda-dcc6ca057b88', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 9, 'فهم محيط شكل ومساحته — تقديرهما وإيجادهما', 'basic', 9),
('b7ffc22a-2d7c-1ef5-ccda-dcc6ca057b88', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 10, 'فهم الطول والكتلة والسعة — تقديرها وقياسها والمقارنة بينها وترتيبها', 'basic', 10),
('b7ffc22a-2d7c-1ef5-ccda-dcc6ca057b88', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 11, 'تمييز فئات النقود — استخدامها في العد وتمثيل المبالغ وحل مسائل مالية', 'basic', 11),
('b7ffc22a-2d7c-1ef5-ccda-dcc6ca057b88', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 12, 'تقدير الزمن وقياسه — قراءة الوقت وكتابته وحل مسائل على الزمن', 'basic', 12)
ON CONFLICT DO NOTHING;

-- Field: الإحصاء والاحتمالات (Statistics and Probability)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('c8aad11b-1e8d-2ef6-ddeb-edd7db168c99', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 13, 'جمع البيانات من البيئة — تنظيمها وتمثيلها بالأعمدة والرموز وقراءتها وتفسيرها', 'basic', 13)
ON CONFLICT DO NOTHING;

-- Grade 6 Math Skills (21 skills)
-- Field: الأعداد والعمليات (Numbers and Operations)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('f6dda55f-5c6b-0ef4-bbcf-cbb6bf057a00', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 14, 'فهم القيمة المنزلية للأعداد ضمن 12 منزلة — تمثيل، قراءة، كتابة، مقارنة، ترتيب، تقريب', 'intermediate', 14),
('f6dda55f-5c6b-0ef4-bbcf-cbb6bf057a00', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 15, 'تمييز الكسور الاعتيادية والأعداد الكسرية والكسور غير الفعلية — تمثيل، مقارنة، ترتيب، تقريب', 'intermediate', 15),
('f6dda55f-5c6b-0ef4-bbcf-cbb6bf057a00', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 16, 'فهم الكسور العشرية — قراءة، كتابة، مقارنة، ترتيب، تقريب، والتحويل بينها وبين الكسور الاعتيادية', 'intermediate', 16),
('f6dda55f-5c6b-0ef4-bbcf-cbb6bf057a00', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 17, 'جمع وطرح الأعداد الكلية ضمن سبع منازل وضربها وقسمتها وحل مسائل حياتية', 'intermediate', 17),
('f6dda55f-5c6b-0ef4-bbcf-cbb6bf057a00', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 18, 'تمييز عوامل عدد ومضاعفاته — إيجادها وحل مسائل حياتية (القاسم المشترك الأكبر والمضاعف المشترك الأصغر)', 'intermediate', 18),
('f6dda55f-5c6b-0ef4-bbcf-cbb6bf057a00', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 19, 'فهم قوى عدد كلي — تمثيلها وإيجادها وإيجاد قيم عبارات عددية', 'intermediate', 19),
('f6dda55f-5c6b-0ef4-bbcf-cbb6bf057a00', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 20, 'فهم النسبة والمعدل والنسبة المئوية والتناسب — إيجادها وحل مسائل حياتية', 'intermediate', 20)
ON CONFLICT DO NOTHING;

INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('f6dda55f-5c6b-0ef4-bbcf-cbb6bf057a00', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 21, 'إجراء العمليات الأربع على الكسور الاعتيادية والأعداد الكسرية وحل مسائل حياتية', 'intermediate', 21),
('f6dda55f-5c6b-0ef4-bbcf-cbb6bf057a00', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 22, 'إجراء العمليات الأربع على الكسور العشرية وحل مسائل حياتية', 'intermediate', 22),
('f6dda55f-5c6b-0ef4-bbcf-cbb6bf057a00', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 23, 'تقدير نواتج العمليات الأربع — الحساب الذهني والتحقق من المعقولية', 'intermediate', 23)
ON CONFLICT DO NOTHING;

-- Field: الجبر والتحليل (Algebra and Analysis)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('a7eeb44a-4d7c-1ef5-ccda-dcc7ca168b11', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 24, 'تمييز الأنماط العددية والهندسية المتنامية — تكوينها وتعميمها واستكشاف العلاقات من جداول البيانات', 'intermediate', 24),
('a7eeb44a-4d7c-1ef5-ccda-dcc7ca168b11', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 25, 'تمييز العبارات الجبرية — كتابتها وإيجاد قيمها وحل المعادلة الخطية البسيطة', 'intermediate', 25)
ON CONFLICT DO NOTHING;

-- Field: الهندسة والقياس (Geometry and Measurement)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('b8ffc33b-3e8d-2ef6-ddeb-edd8db279c22', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 26, 'تمييز المفاهيم الهندسية الأولية — أنواع الزوايا والعلاقات بين المستقيمات والزوايا', 'intermediate', 26),
('b8ffc33b-3e8d-2ef6-ddeb-edd8db279c22', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 27, 'فهم خصائص الأشكال الهندسية ثنائية وثلاثية الأبعاد — تصنيفها والمقارنة بينها', 'intermediate', 27),
('b8ffc33b-3e8d-2ef6-ddeb-edd8db279c22', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 28, 'استخدام المستوى الإحداثي — تسمية مواقع النقاط وتعيينها وتمييز التحويلات الهندسية وإجراؤها', 'intermediate', 28),
('b8ffc33b-3e8d-2ef6-ddeb-edd8db279c22', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 29, 'تمييز العلاقات بين وحدات الطول والكتلة والسعة والزمن — التحويل بين كل منها', 'intermediate', 29),
('b8ffc33b-3e8d-2ef6-ddeb-edd8db279c22', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 30, 'تمييز صيغ المحيط والمساحة لأشكال ثنائية الأبعاد — إيجادها وحل مسائل حياتية', 'intermediate', 30),
('b8ffc33b-3e8d-2ef6-ddeb-edd8db279c22', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 31, 'فهم الحجم والمساحة السطحية للمنشور الرباعي القائم — قياسهما وإيجادهما وحل مسائل', 'intermediate', 31)
ON CONFLICT DO NOTHING;

-- Field: الإحصاء والاحتمالات (Statistics and Probability)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('c9aad22c-2f9e-3ef7-eefc-fee9ec380d33', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 32, 'جمع بيانات كمية ونوعية واقعية — تنظيمها وتمثيلها وقراءتها وتفسيرها', 'intermediate', 32),
('c9aad22c-2f9e-3ef7-eefc-fee9ec380d33', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 33, 'فهم مقاييس النزعة المركزية والمدى — إيجادها وتفسيرها (متوسط، وسيط، منوال، مدى)', 'intermediate', 33),
('c9aad22c-2f9e-3ef7-eefc-fee9ec380d33', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 34, 'فهم التجربة العشوائية — إيجاد نواتجها والتعبير عن الاحتمالات وحل مسائل حياتية', 'intermediate', 34)
ON CONFLICT DO NOTHING;

-- Grade 9 Math Skills (25 skills)
-- Field: الأعداد والعمليات (Numbers and Operations)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('f7dda66a-6d7c-1ef5-ccda-ddd8ca168b11', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 35, 'فهم الأعداد الصحيحة والنسبية — قراءة، كتابة، تمثيل، مقارنة، ترتيب', 'advanced', 35),
('f7dda66a-6d7c-1ef5-ccda-ddd8ca168b11', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 36, 'فهم الأعداد الحقيقية — تصنيفها والمقارنة بينها وترتيبها', 'advanced', 36),
('f7dda66a-6d7c-1ef5-ccda-ddd8ca168b11', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 37, 'إيجاد قوى الأعداد النسبية — تمييز قوانين الأسس وتبسيط العبارات العددية وكتابة الصيغة العلمية', 'advanced', 37),
('f7dda66a-6d7c-1ef5-ccda-ddd8ca168b11', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 38, 'إجراء العمليات الأربع على الأعداد الصحيحة والنسبية والجذور التربيعية وحل مسائل حياتية', 'advanced', 38),
('f7dda66a-6d7c-1ef5-ccda-ddd8ca168b11', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 39, 'إيجاد النسبة ومعدل الوحدة والنسبة المئوية — تمييز العلاقات المتناسبة وحل التناسب وتطبيقات حياتية (زكاة، ربح، خسارة)', 'advanced', 39)
ON CONFLICT DO NOTHING;

-- Field: الجبر والتحليل (Algebra and Analysis)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('a8eeb55b-5e8d-2ef6-ddeb-eee9db279c22', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 40, 'فهم المتتابعة الحسابية والعلاقة — تمثيلهما بيانياً وتمييز العلاقات الخطية', 'advanced', 40),
('a8eeb55b-5e8d-2ef6-ddeb-eee9db279c22', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 41, 'فهم الدالة — تمييز الدوال الخطية والتربيعية وتحديد خصائصها وتمثيلها بيانياً', 'advanced', 41),
('a8eeb55b-5e8d-2ef6-ddeb-eee9db279c22', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 42, 'كتابة عبارات جبرية وإيجاد قيمها وإجراء العمليات عليها وتمييز المتطابقات الأساسية', 'advanced', 42),
('a8eeb55b-5e8d-2ef6-ddeb-eee9db279c22', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 43, 'تحليل الحدود والعبارات الجبرية إلى عواملها وكتابتها في أبسط صورة', 'advanced', 43),
('a8eeb55b-5e8d-2ef6-ddeb-eee9db279c22', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 44, 'كتابة المعادلات الخطية والتربيعية وحلها جبرياً وبيانياً', 'advanced', 44),
('a8eeb55b-5e8d-2ef6-ddeb-eee9db279c22', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 45, 'كتابة نظام معادلتين خطيتين بمتغيرين وحله جبرياً وبيانياً', 'advanced', 45),
('a8eeb55b-5e8d-2ef6-ddeb-eee9db279c22', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 46, 'فهم المتباينة — تمييز المتباينات الخطية والمركبة وكتابتها وحلها وتمثيل حلها على خط الأعداد', 'advanced', 46)
ON CONFLICT DO NOTHING;

-- Field: الهندسة والقياس (Geometry and Measurement)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('b9ffc44c-4f9e-3ef7-eefc-fff0ec380d33', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 47, 'تمييز الزوايا الداخلية للمضلع والعلاقات بين الزوايا الناتجة عن قاطع لمتوازيين', 'advanced', 47),
('b9ffc44c-4f9e-3ef7-eefc-fff0ec380d33', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 48, 'تمييز الأشكال ثلاثية الأبعاد من مخططاتها — التماثل وخصائص الأشكال الرباعية', 'advanced', 48),
('b9ffc44c-4f9e-3ef7-eefc-fff0ec380d33', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 49, 'تمييز خصائص المثلثات والعلاقة بين أضلاع المثلث القائم (نظرية فيثاغورس)', 'advanced', 49),
('b9ffc44c-4f9e-3ef7-eefc-fff0ec380d33', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 50, 'تمييز تطابق مضلعين وتشابههما — استخدامهما في إيجاد القياسات المجهولة', 'advanced', 50),
('b9ffc44c-4f9e-3ef7-eefc-fff0ec380d33', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 51, 'تمييز النسب المثلثية الأساسية للزاوية الحادة ومعكوساتها — استخدامها في حل المثلث القائم', 'advanced', 51),
('b9ffc44c-4f9e-3ef7-eefc-fff0ec380d33', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 52, 'تسمية مواقع النقاط في المستوى الإحداثي — إيجاد المسافة وإحداثيي المنتصف وميل المستقيم ومعادلته', 'advanced', 52),
('b9ffc44c-4f9e-3ef7-eefc-fff0ec380d33', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 53, 'تحديد نوع التحويل الهندسي في المستوى الإحداثي — رسم الصورة الناتجة عن تحويل هندسي', 'advanced', 53),
('b9ffc44c-4f9e-3ef7-eefc-fff0ec380d33', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 54, 'تمييز العلاقات بين وحدات الطول والكتلة والسعة الإنجليزية — التحويل بينها وبين وحدات القياس المترية', 'advanced', 54),
('b9ffc44c-4f9e-3ef7-eefc-fff0ec380d33', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 55, 'تمييز صيغ المحيط والمساحة لأشكال ثنائية الأبعاد — إيجادها وحل مسائل حياتية', 'advanced', 55),
('b9ffc44c-4f9e-3ef7-eefc-fff0ec380d33', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 56, 'تمييز صيغ الحجم والمساحة السطحية لأشكال ثلاثية الأبعاد — إيجادها وحل مسائل', 'advanced', 56)
ON CONFLICT DO NOTHING;

-- Field: الإحصاء والاحتمالات (Statistics and Probability)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('c0aad33d-3a0f-4ef8-ffad-aaa1fd491e44', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 57, 'فهم الدراسة المسحية — جمع البيانات وتنظيمها وتمثيلها وقراءة التمثيلات وتفسيرها واتخاذ القرارات', 'advanced', 57),
('c0aad33d-3a0f-4ef8-ffad-aaa1fd491e44', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 58, 'تحليل البيانات باستخدام مقاييس النزعة المركزية ومقاييس التشتت وتفسيرها والمقارنة بينها', 'advanced', 58),
('c0aad33d-3a0f-4ef8-ffad-aaa1fd491e44', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 59, 'كتابة فضاء العينة لتجربة عشوائية — إيجاد عدد النواتج وتمييز أنواع الحوادث وحساب احتمالاتها', 'advanced', 59)
ON CONFLICT DO NOTHING;

-- Grade 6 Science Skills (33 skills)
-- Field: علوم الحياة (Life Science)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 60, 'وصف تراكيب الخلية وربطها بوظائفها الحيوية', 'intermediate', 60),
('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 61, 'تحديد الاختلافات الأساسية بين الخلية النباتية والخلية الحيوانية من حيث التركيب والوظيفة', 'intermediate', 61),
('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 62, 'تحديد أجهزة الجسم الرئيسة وأعضائها المتخصصة وربطها بوظائفها لدعم نمو المخلوقات الحية وبقائها', 'intermediate', 62),
('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 63, 'وصف الأنماط المختلفة لدورات حياة الحيوانات والنباتات والتغيرات المصاحبة لها والمقارنة بينها', 'intermediate', 63),
('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 64, 'تصنيف المخلوقات الحية إلى مجموعات بناءً على صفاتها الظاهرية المشتركة', 'intermediate', 64),
('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 65, 'تمثيل المجتمع الحيوي وتحديد الجماعات الحيوية التي تعيش فيه ووصف عالقاتها المتبادلة وتفاعلاتها مع المكونات غير الحيوية', 'intermediate', 65),
('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 66, 'وصف مكونات النظام البيئي وتفسير أثر توافر الموارد المختلفة على بقاء المخلوقات الحية واستمرارها واقتراح حلول للمشكلات المؤثرة في استقراره', 'intermediate', 66),
('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 67, 'تمثيل العلاقات بين المخلوقات الحية التي تؤدي إلى تدوير المادة في النظام البيئي وتحديد العلاقة بين النباتات وطاقة الشمس لإنتاج الغذاء', 'intermediate', 67),
('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 68, 'وصف تأثير التغيرات البيئية على النباتات والحيوانات التي تعيش في بيئات محددة — واستنتاج دور التكيفات التركيبية والسلوكية في مساعدتها على البقاء', 'intermediate', 68),
('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 69, 'استنتاج تأثير النشاط الإنساني في المواطن والجماعات البيئية وتوقع أثرها واقتراح الحلول لحمايتها', 'intermediate', 69),
('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 70, 'التعرف على وراثة الصفات وتفسير التباين فيها وتتبع انتقالها من جيل إلى آخر والتمييز بين أنواعها (سائدة ومتنحية) وتوضيح أثر البيئة فيها', 'intermediate', 70)
ON CONFLICT DO NOTHING;

-- Field: العلوم الفيزيائية (Physical Science)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 71, 'استكشاف الخصائص الفيزيائية للمادة وتمييز التركيب الجزيئي لحالاتها المختلفة وتوضيح تغير حالات المادة بسبب الحرارة', 'intermediate', 71),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 72, 'التمييز بين المركب والمخلوط بأنواعه وتوضيح التغيرات الكيميائية للمادة والمفاهيم والطرق ذات الصلة بها ومقارنة كتل المواد عند تغير خصائصها استناداً إلى قانون حفظ الكتلة', 'intermediate', 72),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 73, 'توضيح الرابطة الكيميائية ووصف التفاعلات الكيميائية ومؤشرات حدوثها وأنواعها والعوامل المؤثرة في سرعة التفاعل', 'intermediate', 73),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 74, 'استكشاف الخصائص الكيميائية للمواد والتمييز بين تفاعلات الأحماض والقواعد وخصائصها الكيميائية واستخداماتها', 'intermediate', 74),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 75, 'وصف مفهوم القوة والتمييز بين أنواعها من القوى', 'intermediate', 75),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 76, 'استيعاب قوانين نيوتن الثلاثة وتفسير حركة الأجسام في ضوئها', 'intermediate', 76),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 77, 'تفسير العوامل المؤثرة في أنواع من القوى كقوة التجاذب والاحتكاك والمغناطيسية', 'intermediate', 77),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 78, 'استيعاب مفهوم الطاقة والشغل والتمييز بينهما والتمثيل لهما من واقع حياته', 'intermediate', 78),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 79, 'استيعاب مبدأ حفظ الطاقة أثناء تحولاتها وتطبيقه في الحياة اليومية', 'intermediate', 79),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 80, 'وصف الموجات والتمييز بين خصائصها نظرياً وبيانياً والتنبؤ بحركتها', 'intermediate', 80),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 81, 'استيعاب مفهوم انعكاس وانكسار الضوء وانتقال الصوت وتفسير دورهما في التفاعل والتواصل في البيئة المحيطة', 'intermediate', 81),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 82, 'استيعاب مفهوم الشحنة الكهربائية وشرح تجاذب وتنافر الأجسام المشحونة والمقارنة بين الدوائر الكهربائية على التوالي والتوازي', 'intermediate', 82),
('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 83, 'استيعاب خصائص المغناطيس واستخدامات المغانط في الحياة اليومية', 'intermediate', 83)
ON CONFLICT DO NOTHING;

-- Field: علوم الأرض والفضاء (Earth & Space Science)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('f2dda99f-9c2b-6ef0-bbcf-ccc2bf613a66', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 84, 'وصف التغير في شكل القمر الظاهري أثناء دورانه حول الأرض وتفسير حدوثها', 'intermediate', 84),
('f2dda99f-9c2b-6ef0-bbcf-ccc2bf613a66', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 85, 'تفسير الظواهر المرتبطة بحركة الأرض والقمر والشمس والتغيرات الناتجة عنها (الليل والنهار، الكسوف، الخسوف، الفصول الأربعة)', 'intermediate', 85),
('f2dda99f-9c2b-6ef0-bbcf-ccc2bf613a66', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 86, 'استنتاج تأثير الجاذبية في حركة المجموعة الشمسية والمجرات والظواهر المرتبطة بها', 'intermediate', 86),
('f2dda99f-9c2b-6ef0-bbcf-ccc2bf613a66', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 87, 'تحديد سمات النظام الشمسي ومقارنة المجموعة الشمسية بالمجرة والكون', 'intermediate', 87),
('f2dda99f-9c2b-6ef0-bbcf-ccc2bf613a66', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 88, 'وصف طبقات الغلاف الجوي وتحديد مكوناتها وخصائصها وتغيراتها وتأثيراتها في البيئة وفوائدها للإنسان', 'intermediate', 88),
('f2dda99f-9c2b-6ef0-bbcf-ccc2bf613a66', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 89, 'استنتاج علاقة أغلفة الأرض ببعضها وتوقع التفاعلات والتغيرات التي تحدث بينها والتأثيرات الجيولوجية الناتجة عنها', 'intermediate', 89),
('f2dda99f-9c2b-6ef0-bbcf-ccc2bf613a66', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 90, 'وصف العوامل والعمليات التي أثرت على سطح الأرض وغيرت بعض معالمه (الزلازل، البراكين، التعرية)', 'intermediate', 90),
('f2dda99f-9c2b-6ef0-bbcf-ccc2bf613a66', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 91, 'وصف أنواع الصخور والمعادن وعلاقتها ببعضها وتمييز صفاتها واستخداماتها', 'intermediate', 91),
('f2dda99f-9c2b-6ef0-bbcf-ccc2bf613a66', 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 92, 'تحديد أسباب حدوث الزالزل والبراكين وآثارها وتحديد المواقع الأكثر عرضة لها', 'intermediate', 92)
ON CONFLICT DO NOTHING;

-- Grade 9 Science Skills (48 skills)
-- Field: علوم الحياة (Life Science)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 93, 'استيعاب أن الخلية هي وحدة البناء الأساسية في المخلوقات الحية ومعرفة بعض التقنيات التي ساعدت في دراستها والمقارنة بين المخلوقات وحيدة الخلية ومتعددة الخلايا', 'advanced', 93),
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 94, 'وصف الأحداث الرئيسة لمراحل دورة الخلية والمقارنة بين الانقسام المتساوي والانقسام المنصف', 'advanced', 94),
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 95, 'استيعاب أهمية تكامل تركيب أعضاء أجهزة جسم الإنسان ووظائفها ودور ذلك بالاتزان الداخلي للجسم والحفاظ على صحته', 'advanced', 95),
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 96, 'تصنيف المخلوقات الحية وفق نظام التصنيف الحديث اعتماداً على صفاتها وخصائصها', 'advanced', 96),
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 97, 'توضيح تأثير التغيرات التي تطرأ على التنوع الحيوي في البيئة والإنسان محلياً وعالمياً وشرح أثر قدرة تكيف الأنواع مع ظروف البيئات المتنوعة على التنوع الحيوي', 'advanced', 97),
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 98, 'تفسير تأثير الانقراض على التنوع الحيوي ووصف التغيرات الطارئة على التنوع الحيوي عبر تاريخ الحياة في الأرض', 'advanced', 98),
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 99, 'توضيح كيفية انتقال المادة والطاقة في النظام البيئي وتوقع التغيرات الناتجة عن انقراض أحد مكوناته ووصف دورات المواد في النظام البيئي واستنتاج دورها في دعم استدامته', 'advanced', 99),
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 100, 'وصف أنواع الأنظمة البيئية المائية واليابسة والعلاقات التفاعلية بين مكوناتها', 'advanced', 100),
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 101, 'تحديد سمات النظام البيئي المتوازن وتحليل العوامل والمتغيرات التي تؤثر على اتزانه وشرح أثر الأنشطة البشرية عليها واقتراح الحلول لمعالجة مشكلات بيئية محلية', 'advanced', 101),
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 102, 'وصف مفهوم الكتلة الحيوية ومصادرها وتحديد أهميتها في إنتاج الوقود الحيوي والحد من الانبعاث الكربوني', 'advanced', 102),
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 103, 'وصف تطور علم الوراثة واستخدام قوانين مندل لتفسير توارث الصفات الوراثية واحتمالات ظهورها في الأجيال المختلفة', 'advanced', 103),
('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 104, 'وصف تركيب الكروموسوم والعلاقة بين مكوناته وتوقع نتائج الخلل الذي يطرأ على السلسلة الجينية عند حدوث الطفرات الجينية وتأثيراتها', 'advanced', 104)
ON CONFLICT DO NOTHING;

-- Field: العلوم الفيزيائية (Physical Science)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 105, 'إيضاح تطور النموذج الذري عبر التاريخ وفهم تركيب الذرة ومكوناتها', 'advanced', 105),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 106, 'المقارنة بين المركبات والمخاليط وتصنيف المخاليط واقتراح الطرق المناسبة لفصل مكوناتها والتمييز بين أنواع المحاليل ومكوناتها', 'advanced', 106),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 107, 'تحديد مفهوم الذائبية ومعدل الذوبان في المحلول واستنتاج العوامل المؤثرة على معدل ذوبان المذاب في المذيب', 'advanced', 107),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 108, 'تفسير خصائص السوائل والمقارنة بين المواد الصلبة البلورية وغير البلورية ووصف النمط الذي تترتب فيه بلورات المواد الصلبة', 'advanced', 108),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 109, 'وصف تاريخ الجدول الدوري وإيضاح كيفية تنظيم العناصر فيه وتمييز خصائص العناصر واستخداماتها الشائعة', 'advanced', 109),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 110, 'المقارنة بين الأحماض والقواعد في ضوء خصائصها واستخداماتها وأثرها على الكواشف', 'advanced', 110),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 111, 'إيضاح كيفية ارتباط الذرات ببعضها والتعرف على ماهية الرابطة الكيميائية وكيفية تكوينها والتمييز بين أنواعها', 'advanced', 111),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 112, 'فهم كيفية حدوث التفاعل الكيميائي والتعبير عنه بمعادلة كيميائية موزونة بالاعتماد على قانون حفظ الكتلة وتمييز التفاعلات الكيميائية حسب الطاقة المصاحبة لها', 'advanced', 112),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 113, 'وصف حركة جسم اعتماداً على مفاهيم عناصر الحركة الرئيسة كالسرعة والتسارع والتمييز بينهما', 'advanced', 113),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 114, 'استيعاب مفهوم الزخم وقانون حفظ الزخم', 'advanced', 114),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 115, 'استيعاب مفهوم قوة الاحتكاك وأنواعه وتأثيره في حركة الأجسام', 'advanced', 115),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 116, 'فهم القصور الذاتي وصياغة قانون نيوتن الأول استناداً إليه', 'advanced', 116),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 117, 'فهم قانون نيوتن الثاني نظرياً وبيانياً وتحديد العلاقة بين تسارع الجسم والعوامل المؤثرة فيها', 'advanced', 117),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 118, 'فهم قانون نيوتن الثالث وحساب قيمة القوى المتبادلة رياضياً استناداً إليه', 'advanced', 118)
ON CONFLICT DO NOTHING;

INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 119, 'شرح مفهوم التيار الكهربائي وطرق توليده في الدوائر الكهربائية وعلاقته بالجهد والمقاومة الكهربائية والتمييز بين التيار المستمر والمتردد', 'advanced', 119),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 120, 'فهم العلاقة بين المجال الكهربائي والقوة الكهربائية والمقارنة بين المجال المغناطيسي والمجال الكهربائي نظرياً وبالرسم', 'advanced', 120),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 121, 'المقارنة بين أنواع المواد من حيث قدرتها على التوصيل الكهربائي', 'advanced', 121),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 122, 'تفسير العلاقة بين المجال المغناطيسي والتيار الكهربائي ودورها في تصميم أجهزة تحول الطاقة الكهربائية إلى ميكانيكية والعكس', 'advanced', 122),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 123, 'توضيح مفهوم الطاقة الحرارية وعلاقته بدرجة الحرارة', 'advanced', 123),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 124, 'فهم آلية انتقال وتوصيل الحرارة بين الأجسام وقياس درجة الحرارة', 'advanced', 124),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 125, 'فهم الحرارة النوعية والعوامل المؤثرة فيها', 'advanced', 125),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 126, 'التمييز بين الطاقة الحركية للجسم والطاقة الكامنة والعوامل المؤثرة فيهما', 'advanced', 126),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 127, 'فهم قانون حفظ الطاقة أثناء تحولاتها واقتراح طرق لتوليد الطاقة', 'advanced', 127),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 128, 'فهم سلوك موجات الصوت والخصائص المميزة لها', 'advanced', 128),
('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 129, 'فهم سلوك موجات الضوء والخصائص المميزة لها والتطبيقات المصاحبة لها', 'advanced', 129)
ON CONFLICT DO NOTHING;

-- Field: علوم الأرض والفضاء (Earth & Space Science)
INSERT INTO skills (field_id, grade_id, skill_number, title, difficulty_level, display_order) VALUES
('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 130, 'وصف بعض الأساليب والتقنيات والأدوات المستخدمة في استكشاف الكون', 'advanced', 130),
('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 131, 'تحليل المعلومات المرتبطة بحركة الأجرام السماوية والمواقع الظاهرية والنسبية لها واستنتاج الظروف السائدة بهما', 'advanced', 131),
('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 132, 'شرح أسباب التغيرات المناخية وتأثيراتها والظواهر المرتبطة بها', 'advanced', 132),
('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 133, 'توضيح أهمية دورة الكربون وفائدتها جيولوجياً ووصف الظواهر المرتبطة بها', 'advanced', 133),
('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 134, 'وصف الدورات الطبيعية وتحديد مسبباتها وفوائدها', 'advanced', 134),
('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 135, 'وصف أنواع الصخور والمعادن وصفاتها واستخداماتها', 'advanced', 135),
('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 136, 'توضيح خصائص الصخور المختلفة وطرق تصنيفها ودورة تغيرها من نوع لآخر', 'advanced', 136),
('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 137, 'توضيح أسباب الإجهادات المؤثرة في الصخور المكونة لباطن الأرض ووصف الآثار الناتجة عنها (الصدوع، الزلازل، البراكين)', 'advanced', 137),
('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 138, 'تحليل المعلومات والبيانات المرتبطة بنظرية حركية الصفائح وانجراف القارات لتوقع نتائجها وفوائدها', 'advanced', 138),
('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 139, 'تتبع بعض التغيرات التي حدثت للأرض نتيجة للنشاط البشري واستكشاف المخاطر الطبيعية التي يمكن حدوثها على الأرض وكيفية التنبؤ بها', 'advanced', 139),
('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 140, 'تحديد مصادر الموارد الطبيعية وسبل إدارتها وأهمية المحافظة عليها وتنميتها', 'advanced', 140)
ON CONFLICT DO NOTHING;
