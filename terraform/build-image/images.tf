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

###############################################
###  DCM-SERVICE : Build Image Service  ###
###############################################
resource "null_resource" "dcm-service" {
  provisioner "local-exec" {
    command = "docker build -t ${var.dcm-service-name} ${var.dcm-service-dockerfile}"
  }
}
