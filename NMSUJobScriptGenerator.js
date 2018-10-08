
var NMSUScriptGen = function(div) {
	this.values = {};
	this.containerDiv = div;
	this.inputs = {};
	this.formrows = [];
	this.settings = {
		defaults : {
			email_address : "username@nmsu.edu",
		},
		partitions : {},
	};
	return this;
};

NMSUScriptGen.prototype.returnNewRow = function (rowid, left, right) {
	var l, r, tr;
	l = document.createElement("td");
	r = document.createElement("td");
	tr = document.createElement("tr");
	l.id = rowid + "_left";
	r.id = rowid + "_right";
	tr.id = rowid;
	l.innerHTML = left;
	r.appendChild(right)
	tr.appendChild(l);
	tr.appendChild(r);
	return tr;
}

NMSUScriptGen.prototype.newCheckbox = function(args) {
	var tthis = this;
	var newEl = document.createElement("input");
	newEl.type = "checkbox";
	var formrows = this.formrows;
	if(args.checked)
		newEl.checked = true;
	if(args.toggle)
		newEl.onclick = newEl.onchange = function () {
			formrows[args.toggle].style.display = newEl.checked ? "" : "none";
			tthis.updateJobscript();
		};
	else
		newEl.onclick = newEl.onchange = function () {
			tthis.updateJobscript();
		};
	return newEl;
}

NMSUScriptGen.prototype.newInput = function(args) {
	var tthis = this;
	var newEl = document.createElement("input");
	newEl.type = "text";
	if(args.size)
		newEl.size = args.size;
	if(args.maxLength)
		newEl.maxLength = args.maxLength;
	if(args.value)
		newEl.value = args.value;
	newEl.onclick = newEl.onchange = function () {
		tthis.updateJobscript();
	};
	return newEl;
}

NMSUScriptGen.prototype.newSelect = function(args) {
	var tthis = this;
	var newEl = document.createElement("select");
	if(args.options) {
		for(var i in args.options) {
			var newOpt = document.createElement("option");
			newOpt.value = args.options[i][0];
			newOpt.text = args.options[i][1];
			if(args.selected && args.selected == args.options[i][0])
				newOpt.selected = true;
			newEl.appendChild(newOpt);
		}
	}
	newEl.onclick = newEl.onchange = function () {
		tthis.updateJobscript();
	};
	return newEl;
}

NMSUScriptGen.prototype.newSpan = function() {
	var newEl = document.createElement("span");
	if(arguments[0])
		newEl.id = arguments[0];
	for (var i = 1; i < arguments.length; i++) {
		if(typeof arguments[i] == "string") {
			newEl.appendChild(document.createTextNode(arguments[i]));
		} else
			newEl.appendChild(arguments[i]);
	}
	return newEl;
};

NMSUScriptGen.prototype.newA = function(url, body) {
	var a = document.createElement("a");
	a.href = url;
	a.appendChild(document.createTextNode(body));
	a.target = "_base";
	return a;
}



NMSUScriptGen.prototype.createForm = function(doc) {
	function br() {
		return document.createElement("br");
	}
	function newHeaderRow(text) {
		var headertr = document.createElement("tr");
		var headerth = document.createElement("th");
		headerth.colSpan = 2;
		headerth.appendChild(document.createTextNode(text));
		headertr.appendChild(headerth);
		return headertr;
	}

	var newEl;
	form = document.createElement("form");
	var table = document.createElement("table");
	form.appendChild(table);
	table.appendChild(newHeaderRow("Parameters"));
    //
    this.inputs.job_name = this.newInput({});
    this.inputs.output_name = this.newInput({});
	this.inputs.single_node = this.newInput({value:1});
	this.inputs.num_cores = this.newInput({value:1});
	this.inputs.num_cpus = this.newInput({value:1, size:3});
	//this.inputs.mem_per_core = this.newInput({value:1, size:6});
	this.inputs.mem_units = this.newSelect({options:[["GB", "GB"],["MB", "MB"]]});
   	this.inputs.walldays = this.newInput({value:"0", size:1});
	this.inputs.wallhours = this.newInput({value:"00", size:2});
	this.inputs.wallmins = this.newInput({value:"01", size:2, maxLength:2});
	this.inputs.wallsecs = this.newInput({value:"00", size:2, maxLength:2});
	this.inputs.is_requeueable = this.newCheckbox({checked:0});
	
	this.inputs.email_begin = this.newCheckbox({checked:0});
	this.inputs.email_end = this.newCheckbox({checked:0});
	this.inputs.email_abort = this.newCheckbox({checked:0});
	this.inputs.email_address = this.newInput({value:this.settings.defaults.email_address});

    table.appendChild(this.returnNewRow("nmsu_sg_row_jobname", "Job name: ", this.inputs.job_name));
    table.appendChild(this.returnNewRow("nmsu_sg_row_jobname", "Output name: ", this.inputs.output_name));
    
    
    
    
    this.inputs.partitions = [];
    if(this.settings.partitions.show) {
        var partitions_span = this.newSpan("nmsu_sg_input_partitions");
        for(var i in this.settings.partitions.names) {
            var new_checkbox = this.newCheckbox({checked:0});
            new_checkbox.partition_name = this.settings.partitions.names[i];
            this.inputs.partitions.push(new_checkbox);
            var partition_container = this.newSpan(null);
            partition_container.className = "nmsu_sg_input_partition_container";
            var name_span = this.newSpan("nmsu_sg_input_partition_" + new_checkbox.partition_name, new_checkbox, this.settings.partitions.names[i]);
            name_span.className = "nmsu_sg_input_partition_name";
            partition_container.appendChild(name_span);
            if(this.settings.partitions_status && this.settings.partitions_status[this.settings.partitions.names[i]]) {
                var partition_status = this.settings.partitions_status[this.settings.partitions.names[i]];
                partition_container.appendChild(this.newSpan(null, "", partition_status.nodes_from));
            }
            partitions_span.appendChild(partition_container);
        }
        table.appendChild(this.returnNewRow("nmsu_sg_input_partitions", "Partition: ", partitions_span));
    }
    
  
	table.appendChild(this.returnNewRow("nmsu_sg_row_onenode", "Number of nodes to use: ", this.inputs.single_node));
	table.appendChild(this.returnNewRow("nmsu_sg_row_numcores", "Number of tasks to run <b>across all nodes</b>: ", this.inputs.num_cores));
	table.appendChild(this.returnNewRow("nmsu_sg_row_numgpus", "Number of threads per task: ", this.inputs.num_cpus));
	//table.appendChild(this.returnNewRow("nmsu_sg_row_mempercore", "Memory per processor core: ", this.newSpan(null, this.inputs.mem_per_core, this.inputs.mem_units)));
	table.appendChild(this.returnNewRow("nmsu_sg_row_walltime", "Walltime: ", this.newSpan(null, this.inputs.walldays, " days ",this.inputs.wallhours, " hours ", this.inputs.wallmins, " mins ", this.inputs.wallsecs, " secs")));
	table.appendChild(this.returnNewRow("nmsu_sg_row_requeueable", "Job is requeueable: ", this.inputs.is_requeueable));
    	table.appendChild(this.returnNewRow("nmsu_sg_row_emailaddress", "Email address: ", this.inputs.email_address));
	table.appendChild(this.returnNewRow("nmsu_sg_row_emailevents", "Receive email for job events: ",
				this.newSpan(null,
						this.inputs.email_begin,
						" begin ",
						this.inputs.email_end,
						" end ",
						this.inputs.email_abort,
						" abort"
					    )
			 ));

	return form;
}; /* end createForm() */

NMSUScriptGen.prototype.retrieveValues = function() {
	var jobnotes = [];
	//this.values.MB_per_core = Math.round(this.inputs.mem_per_core.value * (this.inputs.mem_units.value =="GB" ? 1024 : 1));

	this.values.partitions = [];
	for(var i in this.inputs.partitions) {
		if(this.inputs.partitions[i].checked){
			this.values.partitions.push(this.inputs.partitions[i].partition_name);
		} else {
		}
	}

	this.values.is_requeueable = this.inputs.is_requeueable.checked;
	this.values.walltime_in_minutes = this.inputs.walldays.value * 24 * 3600 + this.inputs.wallhours.value * 3600 + this.inputs.wallmins.value * 60;
	this.values.num_cores = this.inputs.num_cores.value;
    	this.values.nodes = this.inputs.single_node.value;
    	this.values.gpus = this.inputs.num_cpus.value;
	this.values.job_name = this.inputs.job_name.value;
    	this.values.output_name = this.inputs.output_name.value;
	this.values.sendemail = {};
	this.values.sendemail.begin = this.inputs.email_begin.checked;
	this.values.sendemail.end = this.inputs.email_end.checked;
	this.values.sendemail.abort = this.inputs.email_abort.checked;
	this.values.email_address = this.inputs.email_address.value;

    
	/* Add warnings, etc. to jobnotes array */
	if(this.values.MB_per_core > 20*1024*1024)
        	jobnotes.push("Error: Are you crazy? That is way too much RAM!");
	if(this.values.walltime_in_minutes > ((86400*7)+3600) && this.values.partitions.indexOf("gpu") > -1)
		jobnotes.push("Error: Partition gpu maximum walltime is 7 days and 1 hour");
	if(this.values.walltime_in_minutes > ((86400*7)+3600) && this.values.partitions.indexOf("normal") > -1)
		jobnotes.push("Error: Partition normal maximum walltime is 7 days and 1 hour");
    	if(this.values.walltime_in_minutes > 3600 && this.values.partitions.indexOf("debug") > -1)
        	jobnotes.push("Error: Partition debug maximum walltime is 1 hour");
	
	this.jobNotesDiv.innerHTML = jobnotes.join("<br/>\n");
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////      G E N N E R A T I N G    T H E    S L U R M    S C R I P T     //////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

NMSUScriptGen.prototype.generateScriptSLURM = function () {
    
	//var pbscompat = true;
	var pmemmb;
	var procs;
	var features = "";

	var scr = "#!/bin/bash\n\n#Submit this script with: sbatch thefilename\n\n";
	var sbatch = function sbatch(txt) {
		scr += "#SBATCH " + txt + "\n";
	};
    	var procs;
	
    	//job name
    	if(this.inputs.job_name.value && this.inputs.job_name.value != "") {
        	sbatch("--job-name " + this.inputs.job_name.value + "   ##name that will show up in the queue");
    	}
    
    	//output name
    	if(this.inputs.output_name.value && this.inputs.output_name.value != "") {
        	sbatch("--output " + this.inputs.output_name.value + "   ##filename of the output; the %j will append the jobID to the end of the name making the output files unique despite the sane job name; default is slurm-[jobID].out");
    	}
    
    	//number of nodes to use; default = 1
    	sbatch("--nodes " + this.inputs.single_node.value + "  ##number of nodes to use");
    
    	//number of tasks (analyses) to run; default = 1
    	sbatch("--ntasks " + this.values.num_cores + "  ##number of tasks (analyses) to run");
    
    	//time for analysis (day-hour:min:sec). defaut = 0-00:01:00
    	sbatch("--time " + this.inputs.walldays.value + "-" + this.inputs.wallhours.value + ":" + this.inputs.wallmins.value + ":" + this.inputs.wallsecs.value + "  ##time for analysis (day-hour:min:sec)");
    
    	//the number of threads the code will use; default = 1
    	sbatch("--cpus-per-task " + this.inputs.num_cpus.value + "  ##the number of threads the code will use");

    	//the partition to run in [options: normal, gpu, debug]; default = normal
    	if(!this.values.partitions.length == 1) {
        	sbatch("--partition normal  ##the partition to run in [options: normal, gpu, debug]");
    	} else {
        	var partitions = this.values.partitions.join(",");
       		sbatch("--partition " + partitions + "  ##the partition to run in [options: normal, gpu, debug]");
    	}

	//sbatch("--mem-per-cpu=" + this.inputs.mem_per_core.value + this.inputs.mem_units.value.substr(0,1) + "   # memory per CPU core");

    	//requeueable
    	if(this.inputs.is_requeueable.checked)
        	sbatch("--requeue  ##requeue when preempted and on node failure");
    
    	//emain options
	if(this.inputs.email_begin.checked || this.inputs.email_end.checked || this.inputs.email_abort.checked) {
        sbatch("--mail-user " + this.values.email_address + "  ##your email address");
		if(this.inputs.email_address.value == this.settings.defaults.email_address)
			scr += "echo \"$USER: Please change the --mail-user option to your real email address before submitting. Then remove this line.\"; exit 1\n";
		if(this.inputs.email_begin.checked)
			sbatch("--mail-type BEGIN  ##slurm will email you when your job starts");
		if(this.inputs.email_end.checked)
			sbatch("--mail-type END  ##slurm will email you when your job ends");
		if(this.inputs.email_abort.checked)
			sbatch("--mail-type FAIL  ##slurm will email you when your job fails");
	}
    
    scr += "\n\n## Load modules, insert code, and run your programs here.\n";
    
	return scr;
};


function stackTrace() {
    var err = new Error();
    return err.stack;
}


NMSUScriptGen.prototype.updateJobscript = function() {
	this.retrieveValues();
	this.toJobScript();
	return;
};


NMSUScriptGen.prototype.init = function() {
	this.inputDiv = document.createElement("div");
	this.inputDiv.id = "nmsu_sg_input_container";
	this.containerDiv.appendChild(this.inputDiv);

	var scriptHeader = document.createElement("h1");
	scriptHeader.id = "nmsu_sg_script_header";
	scriptHeader.appendChild(document.createTextNode("SLURM Job Script"));
	this.containerDiv.appendChild(scriptHeader);

	this.form = this.createForm();
	this.inputDiv.appendChild(this.form);

	this.jobNotesDiv = document.createElement("div");
	this.jobNotesDiv.id = "nmsu_sg_jobnotes";
	this.containerDiv.appendChild(this.jobNotesDiv);

	this.jobScriptDiv = document.createElement("div");
	this.jobScriptDiv.id = "nmsu_sg_jobscript";
	this.containerDiv.appendChild(this.jobScriptDiv);

	this.updateJobscript();
};


NMSUScriptGen.prototype.toJobScript = function() {
    scr = this.generateScriptSLURM();
	this.jobScriptDiv.innerHTML = "<pre>" + scr + "</pre>";
};
