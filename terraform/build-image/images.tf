###############################################
###               Variables                 ###
###############################################
variable "dcm-service-dockerfile" {
  default = "." 
}

variable "dcm-service-name" {
  default = "dcm-service" 
}

variable "dcm-service-directory" {
  default = "dcm-service"  
}

variable "dcm-service-source" {
  default = "source"  
}

variable "dcm-service-npminstall" {
  default = "npm install --production"
}

variable "dcm-service-npmtest" {
  default = "npm test"
}

###############################################
###  DCM-SERVICE : Build Image Service  ###
###############################################
resource "null_resource" "dcm-service-install" {
  provisioner "local-exec" {
    working_dir = "${var.dcm-service-source}"
    command = "${var.dcm-service-npminstall}"
  }
}

resource "null_resource" "dcm-service-test" {
  depends_on = [null_resource.dcm-service-install]
  provisioner "local-exec" {
    working_dir = "${var.dcm-service-source}"
    command = "${var.dcm-service-npmtest}"
  }
}

resource "null_resource" "dcm-service" {
  depends_on = [null_resource.dcm-service-test]
  provisioner "local-exec" {
    command = "docker build -t ${var.dcm-service-name} ${var.dcm-service-dockerfile}"
  }
}
