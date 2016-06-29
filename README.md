
1. Introduction
=====================================

Free. Open Source. #s3multiUploadProgess is a tool for uploading multiple files on S3 with progress bar.


2. Requirements
===================================

This is a list of major #s3multiUploadProgess dependencies:

	Python 2,3
	Django


3. Installation Guide
==========================================

	3.1. Clone Code
		cd ~
		git clone "https://github.com/" s3multiUpload
		cd s3multiUpload

	3.2. Setup Virtual Environmant

		3.2.1. sudo apt-get install python python-pip virtualenvwrapper

		3.2.2. mkvirtualenv s3uploadenv

		3.2.3. source s3uploadenv/bin/activate

	3.3. Install Requirements

		3.3.1. pip install requirements

	3.4. S3 Setup
		Setup a CORS policy on your S3 bucket.
		<CORSConfiguration>
		    <CORSRule>
		        <AllowedOrigin>*</AllowedOrigin>
		        <AllowedMethod>PUT</AllowedMethod>
		        <AllowedMethod>POST</AllowedMethod>
		        <AllowedMethod>GET</AllowedMethod>
		        <MaxAgeSeconds>3000</MaxAgeSeconds>
		        <AllowedHeader>*</AllowedHeader>
		 </CORSRule>
		</CORSConfiguration>

	3.5. Django Setup

		- Open settings.py

		- Add 's3direct' in Installed apps
		INSTALLED_APPS = [
			...
			's3direct',
			...
		]

	3.6. Add Your AWS Access Key and secrate in ~/example/example/settings.py
	
		AWS_ACCESS_KEY_ID = 'your_aws_access_id'
		AWS_SECRET_ACCESS_KEY = 'your_aws_secrate_access_key'
		AWS_STORAGE_BUCKET_NAME = 'your_aws_bucket_name'
		S3DIRECT_REGION = 'your_aws_region'

	3.7. Run
	
	3.7.1. cd example
	
	3.7.2. python manage.py runserver
	
3.8. Open Browser go to
	localhost:8000/form
